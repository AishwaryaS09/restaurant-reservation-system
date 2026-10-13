
const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

test('GET /api/health returns OK', async () => {
  const server = app.listen(0);

  try {
    await new Promise((resolve) => {
      server.once('listening', resolve);
    });

    const address = server.address();
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/health`
    );

    assert.equal(response.status, 200);

    const data = await response.json();

    assert.equal(data.status, 'OK');
    assert.ok(data.timestamp);
    assert.ok(!Number.isNaN(Date.parse(data.timestamp)));
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
});
