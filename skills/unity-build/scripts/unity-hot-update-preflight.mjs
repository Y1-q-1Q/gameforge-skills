#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, extname, join, relative, resolve } from 'path';

const args = parseArgs(process.argv.slice(2));
const project = resolve(args.project || args.root || process.cwd());
const jsonOut = args.out ? resolve(args.out) : null;
const mdOut = args.markdown ? resolve(args.markdown) : null;
const findings = [];
const evidence = {};

const ignoredDirs = new Set(['Library', 'Temp', 'Obj', 'Build', 'Builds', 'Logs', 'UserSettings', '.git', 'node_modules']);
const codeExts = new Set(['.cs', '.asmdef', '.json', '.xml', '.yaml', '.yml', '.asset', '.prefab', '.unity']);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const n = argv[i + 1];
      if (!n || n.startsWith('--')) out[k] = true;
      else out[k] = argv[++i];
    }
  }
  return out;
}

function add(severity, id, message, file = null, line = null, detail = null) {
  findings.push({ severity, id, message, file, line, detail });
}

function readJson(rel) {
  const full = join(project, rel);
  if (!existsSync(full)) return null;
  try { return JSON.parse(readFileSync(full, 'utf8')); } catch { return null; }
}

function readText(rel) {
  const full = join(project, rel);
  if (!existsSync(full)) return null;
  try { return readFileSync(full, 'utf8'); } catch { return null; }
}

function listExisting(candidates) {
  return candidates.filter(p => existsSync(join(project, p))).map(p => p.replace(/\\/g, '/'));
}

function walk(dir, visit) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) continue;
      walk(join(dir, entry.name), visit);
      continue;
    }
    if (!entry.isFile()) continue;
    const full = join(dir, entry.name);
    const st = statSync(full);
    if (st.size > 1024 * 1024) continue;
    visit(full);
  }
}

function grepAssets() {
  const patterns = [
    { id: 'resources-load', severity: 'WARN', re: /\bResources\.Load(?:Async)?\s*</, message: 'Resources.Load usage can bypass Addressables/hot-update asset ownership.' },
    { id: 'assetbundle-loadfromfile', severity: 'WARN', re: /\bAssetBundle\.LoadFromFile(?:Async)?\s*\(/, message: 'Direct AssetBundle.LoadFromFile usage needs version/hash/rollback discipline.' },
    { id: 'hardcoded-http', severity: 'WARN', re: /['"]https?:\/\/[^'"]+['"]/, message: 'Hardcoded remote URL found; verify environment switching, CDN, and rollback.' },
    { id: 'persistent-data-path', severity: 'WARN', re: /\bApplication\.persistentDataPath\b/, message: 'persistentDataPath usage found; verify cache migration/cleanup for hot update.' },
    { id: 'reflection-heavy', severity: 'WARN', re: /\b(Type\.GetType|Assembly\.Load|GetMethod\(|Invoke\(|Activator\.CreateInstance)\b/, message: 'Reflection-heavy pattern found; verify HybridCLR/AOT/link.xml coverage.' },
  ];
  const counts = Object.fromEntries(patterns.map(p => [p.id, 0]));
  walk(join(project, 'Assets'), full => {
    if (!codeExts.has(extname(full).toLowerCase())) return;
    let text;
    try { text = readFileSync(full, 'utf8'); } catch { return; }
    const rel = relative(project, full).replace(/\\/g, '/');
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      for (const p of patterns) {
        if (p.re.test(lines[i])) {
          counts[p.id]++;
          add(p.severity, p.id, p.message, rel, i + 1, lines[i].trim().slice(0, 160));
        }
      }
    }
  });
  evidence.riskGrepCounts = counts;
}

if (!existsSync(project)) {
  add('BLOCKED', 'project-missing', 'Unity project root does not exist.', null, null, project);
} else {
  const versionText = readText('ProjectSettings/ProjectVersion.txt');
  if (!versionText) add('BLOCKED', 'missing-unity-version', 'Missing ProjectSettings/ProjectVersion.txt.');
  else {
    const m = versionText.match(/m_EditorVersion:\s*(.+)/);
    evidence.unityVersion = m?.[1]?.trim() || 'unknown';
  }

  const manifest = readJson('Packages/manifest.json');
  if (!manifest) add('BLOCKED', 'missing-package-manifest', 'Missing or invalid Packages/manifest.json.');
  else {
    const deps = manifest.dependencies || {};
    evidence.packages = Object.keys(deps).sort();
    const hasAddressables = Boolean(deps['com.unity.addressables']);
    const hasHybridClr = Object.keys(deps).some(k => /hybridclr/i.test(k)) || Object.values(deps).some(v => /hybridclr/i.test(String(v)));
    if (!hasAddressables) add('WARN', 'addressables-package-missing', 'com.unity.addressables not found in package manifest.');
    else evidence.addressablesPackage = deps['com.unity.addressables'];
    if (!hasHybridClr) add('WARN', 'hybridclr-package-missing', 'HybridCLR package reference not found in package manifest.');
    else evidence.hybridclrPackage = true;
  }

  const addressablesEvidence = listExisting([
    'Assets/AddressableAssetsData',
    'Assets/AddressableAssetsData/AddressableAssetSettings.asset',
    'Assets/AddressableAssetsData/DefaultObject.asset',
  ]);
  evidence.addressablesEvidence = addressablesEvidence;
  if (!addressablesEvidence.length) add('WARN', 'addressables-settings-missing', 'Addressables settings folder/evidence not found.');

  const hybridEvidence = listExisting([
    'Assets/HybridCLRGenerate',
    'Assets/HybridCLRGenerate/LinkGenerator',
    'Assets/HybridCLRGenerate/AOTGenericReferences.cs',
    'Assets/Resources/link.xml',
    'Assets/link.xml',
    'HybridCLRData',
  ]);
  evidence.hybridclrEvidence = hybridEvidence;
  if (!hybridEvidence.length) add('WARN', 'hybridclr-generated-evidence-missing', 'HybridCLR generated/AOT/link evidence not found.');

  const ciEvidence = listExisting([
    '.github/workflows',
    '.gitlab-ci.yml',
    'Jenkinsfile',
    'Build',
    'Builds',
    'Assets/Editor',
  ]);
  evidence.buildCiEvidence = ciEvidence;
  if (!ciEvidence.length) add('WARN', 'build-ci-evidence-missing', 'No build/CI/editor automation evidence found.');

  grepAssets();
}

const blocked = findings.filter(f => f.severity === 'BLOCKED').length;
const warn = findings.filter(f => f.severity === 'WARN').length;
const status = blocked ? 'BLOCKED' : warn ? 'WARN' : 'PASS';
const report = {
  status,
  project,
  generatedAt: new Date().toISOString(),
  scanner: { name: 'unity-hot-update-preflight', version: '0.1.0', localOnly: true, readOnly: true },
  caveat: 'This scanner finds release-risk evidence; it does not guarantee release safety.',
  summary: { blocked, warn, pass: status === 'PASS' },
  evidence,
  findings,
  rerun: `node skills/unity-build/scripts/unity-hot-update-preflight.mjs --project ${project} --out <report.json> --markdown <report.md>`,
};

if (jsonOut) { mkdirSync(dirname(jsonOut), { recursive: true }); writeFileSync(jsonOut, JSON.stringify(report, null, 2) + '\n'); }
if (mdOut) { mkdirSync(dirname(mdOut), { recursive: true }); writeFileSync(mdOut, toMarkdown(report)); }
console.log(JSON.stringify(report.summary));
if (status === 'BLOCKED') process.exitCode = 2;

function toMarkdown(r) {
  const lines = [];
  lines.push('# Unity Hot-Update Release Preflight');
  lines.push('');
  lines.push(`- **Status:** ${r.status}`);
  lines.push(`- **Generated:** ${r.generatedAt}`);
  lines.push(`- **Project:** \`${r.project}\``);
  lines.push(`- **Unity version:** ${r.evidence.unityVersion || 'unknown'}`);
  lines.push(`- **Blocked:** ${r.summary.blocked}`);
  lines.push(`- **Warnings:** ${r.summary.warn}`);
  lines.push(`- **Mode:** local-only, read-only`);
  lines.push(`- **Caveat:** ${r.caveat}`);
  lines.push('');
  lines.push('## Evidence');
  lines.push('');
  lines.push(`- Addressables package: ${r.evidence.addressablesPackage || 'not found'}`);
  lines.push(`- Addressables evidence: ${(r.evidence.addressablesEvidence || []).join(', ') || 'not found'}`);
  lines.push(`- HybridCLR package: ${r.evidence.hybridclrPackage ? 'found' : 'not found'}`);
  lines.push(`- HybridCLR evidence: ${(r.evidence.hybridclrEvidence || []).join(', ') || 'not found'}`);
  lines.push(`- Build/CI evidence: ${(r.evidence.buildCiEvidence || []).join(', ') || 'not found'}`);
  lines.push(`- Risk grep counts: \`${JSON.stringify(r.evidence.riskGrepCounts || {})}\``);
  lines.push('');
  lines.push('## Findings');
  lines.push('');
  if (!r.findings.length) lines.push('No findings.');
  for (const f of r.findings) {
    const loc = f.file ? `\`${f.file}${f.line ? `:${f.line}` : ''}\`` : '`project-level`';
    lines.push(`- **${f.severity}** \`${f.id}\` at ${loc}: ${f.message}${f.detail ? ` Detail: \`${String(f.detail).replace(/`/g, '\\`')}\`` : ''}`);
  }
  lines.push('');
  lines.push('## Rerun');
  lines.push('');
  lines.push('```powershell');
  lines.push(r.rerun);
  lines.push('```');
  return lines.join('\n') + '\n';
}
