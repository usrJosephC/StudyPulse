import assert from 'node:assert/strict';

// Integration check for the LOCAL gateway; never prints credentials or tokens.
const base = 'http://localhost:54321';
const headers = 'apikey,authorization,content-type,prefer,accept-profile,content-profile,x-client-info,x-supabase-api-version';
let assertions = 0;
for (const origin of ['http://localhost:8081', 'http://localhost:3000', 'http://127.0.0.1:8082', 'http://192.168.15.5:8081']) {
  for (const route of ['/auth/v1/token', '/rest/v1/daily_tasks', '/rest/v1/rpc/rpc_check_in']) {
    const response = await fetch(`${base}${route}`, {
      method: 'OPTIONS',
      headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': headers },
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
    const allowed = response.headers.get('access-control-allow-headers').toLowerCase().split(',').map(s => s.trim());
    for (const name of headers.split(',')) assert.ok(allowed.includes(name), `${route}: ${name}`);
    assert.ok(response.headers.get('vary').includes('Origin'));
    assertions += 11;
  }
}
for (const origin of ['https://example.org', 'http://localhost.evil.example:8081', 'null']) {
  const response = await fetch(`${base}/rest/v1/daily_tasks`, { method: 'OPTIONS', headers: { Origin: origin } });
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  assertions++;
}
const error = await fetch(`${base}/auth/v1/token?grant_type=password`, {
  method: 'POST', headers: { Origin: 'http://localhost:3000', 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'cors-negative@example.invalid', password: 'invalid-password' }),
});
assert.ok(error.status >= 400 && error.status < 500);
assert.equal(error.headers.get('access-control-allow-origin'), 'http://localhost:3000');
assert.ok(error.headers.get('content-type').includes('application/json'));
assertions += 3;
console.log(`PASS: ${assertions} CORS assertions; allowed origins, required headers, denied origins, readable auth failure.`);
