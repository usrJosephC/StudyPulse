import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const folder = new URL('../supabase/tests/', import.meta.url);
let total = 0;
let failures = 0;
for (const file of readdirSync(folder).filter(name => name.endsWith('.sql')).sort()) {
  const result = spawnSync('docker-compose', ['exec', '-T', 'db', 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-A', '-t'], {
    cwd: root, input: readFileSync(new URL(file, folder)), encoding: 'utf8', timeout: 120000,
  });
  const output = result.stdout ?? '';
  const plan = output.match(/^1\.\.(\d+)$/m);
  const passed = output.match(/^ok \d+\b/gm) ?? [];
  const bad = output.match(/^not ok .*$/gm) ?? [];
  const valid = result.status === 0 && plan && passed.length === Number(plan[1]) && bad.length === 0 && /^ROLLBACK$/m.test(output);
  if (!valid) {
    failures++;
    console.error(`FAIL ${file}: ${passed.length}/${plan?.[1] ?? '?'}; ${bad.join('; ')}`);
    console.error(result.error?.message ?? result.stderr ?? '');
  } else {
    total += passed.length;
    console.log(`PASS ${file}: ${passed.length} assertions, ROLLBACK`);
  }
}
console.log(`${total} assertions passed; ${failures} suites failed.`);
if (failures) process.exitCode = 1;
