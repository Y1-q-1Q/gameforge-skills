#!/usr/bin/env node
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const root = mkdtempSync(join(tmpdir(), 'gf-unity-preflight-fixtures-'));
const reports = join(root, 'reports');
const scanner = resolve(dirname(fileURLToPath(import.meta.url)), 'unity-hot-update-preflight.mjs');

function put(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf8');
}

function unityBase(name, { manifest = true, addressables = true, hybridclr = true, build = true, risky = false } = {}) {
  const dir = join(root, name);
  put(join(dir, 'ProjectSettings/ProjectVersion.txt'), 'm_EditorVersion: 2022.3.18f1\n');
  if (manifest) {
    put(join(dir, 'Packages/manifest.json'), JSON.stringify({ dependencies: {
      ...(addressables ? { 'com.unity.addressables': '1.21.21' } : {}),
      ...(hybridclr ? { 'com.focus-creative-games.hybridclr_unity': 'https://github.com/focus-creative-games/hybridclr_unity.git' } : {})
    } }, null, 2));
  }
  if (addressables) put(join(dir, 'Assets/AddressableAssetsData/AddressableAssetSettings.asset'), '%YAML 1.1\n');
  if (hybridclr) {
    put(join(dir, 'Assets/HybridCLRGenerate/AOTGenericReferences.cs'), '// generated fixture\n');
    put(join(dir, 'Assets/Resources/link.xml'), '<linker></linker>\n');
  }
  if (build) put(join(dir, 'Assets/Editor/BuildScript.cs'), 'public static class BuildScript { public static void BuildPlayer() {} }\n');
  if (risky) {
    put(join(dir, 'Assets/Scripts/HotUpdateRisk.cs'), 'using UnityEngine; using System; public class HotUpdateRisk:MonoBehaviour { void Start(){ var x = Resources.Load<GameObject>("foo"); var p = Application.persistentDataPath; var t = Type.GetType("Foo"); } }\n');
  } else {
    put(join(dir, 'Assets/Scripts/SafeHotUpdateEntry.cs'), 'using UnityEngine; public class SafeHotUpdateEntry : MonoBehaviour { void Start(){ Debug.Log("fixture"); } }\n');
  }
  return dir;
}

function runCase(name, dir, expectedStatus) {
  const out = join(reports, `${name}.json`);
  const md = join(reports, `${name}.md`);
  mkdirSync(reports, { recursive: true });
  const res = spawnSync(process.execPath, [scanner, '--project', dir, '--out', out, '--markdown', md], { encoding: 'utf8' });
  if (!existsSync(out)) {
    throw new Error(`${name}: scanner did not write JSON report. exit=${res.status} stdout=${res.stdout} stderr=${res.stderr}`);
  }
  const report = JSON.parse(readFileSync(out, 'utf8'));
  if (report.status !== expectedStatus) {
    throw new Error(`${name}: expected ${expectedStatus}, got ${report.status}. stdout=${res.stdout} stderr=${res.stderr}`);
  }
  if (expectedStatus === 'BLOCKED' && res.status !== 2) throw new Error(`${name}: expected scanner exit 2 for BLOCKED, got ${res.status}`);
  if (expectedStatus !== 'BLOCKED' && res.status !== 0) throw new Error(`${name}: expected scanner exit 0, got ${res.status}`);
  return { name, expectedStatus, actualStatus: report.status, summary: report.summary, report: out, markdown: md };
}

try {
  const clean = unityBase('clean');
  const warn = unityBase('warn-risky', { risky: true });
  const blocked = unityBase('blocked-missing-manifest', { manifest: false, addressables: false, hybridclr: false, build: false });
  const results = [
    runCase('clean', clean, 'PASS'),
    runCase('warn-risky', warn, 'WARN'),
    runCase('blocked-missing-manifest', blocked, 'BLOCKED'),
  ];
  console.log(JSON.stringify({ status: 'ok', results }, null, 2));
} finally {
  rmSync(root, { recursive: true, force: true });
}
