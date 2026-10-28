// Start and stop one throwaway WordPress Playground server.
//
// The server is the pinned @wp-playground/cli binary from node_modules (the same
// package `npx @wp-playground/cli@<pin>` resolves to), spawned directly so that
// the PID we hold is the server itself. It is stopped by that PID only.

import { spawn } from 'node:child_process';
import { createWriteStream, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const READY = /Ready! WordPress is running on (http:\/\/\S+)/;

export function cliVersion() {
  return require('@wp-playground/cli/package.json').version;
}

function cliBin() {
  const pkgPath = require.resolve('@wp-playground/cli/package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const bin = typeof pkg.bin === 'string' ? pkg.bin : Object.values(pkg.bin)[0];
  return path.join(path.dirname(pkgPath), bin);
}

export async function startPlayground({ pins, blueprintPath, mounts, logFile, timeoutMs = 300_000 }) {
  const { php, wp, port, playground_cli: pinnedCli } = pins.platform;
  const installed = cliVersion();
  if (installed !== pinnedCli) {
    throw new Error(`@wp-playground/cli ${installed} is installed but ${pinnedCli} is pinned. Run npm ci.`);
  }
  const args = [
    cliBin(),
    'server',
    `--php=${php}`,
    `--wp=${wp}`,
    `--port=${port}`,
    `--blueprint=${blueprintPath}`,
    '--blueprint-may-read-adjacent-files',
    ...mounts.map((m) => `--mount=${m}`),
  ];
  const log = createWriteStream(logFile);
  log.write(`$ node ${args.join(' ')}\n`);
  const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });

  const url = await new Promise((resolve, reject) => {
    let buffer = '';
    const timer = setTimeout(() => reject(new Error(`Playground not ready after ${timeoutMs} ms; see ${logFile}`)), timeoutMs);
    const onData = (chunk) => {
      const text = chunk.toString();
      log.write(text);
      buffer += text;
      const match = buffer.match(READY);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Playground exited with code ${code} before it was ready; see ${logFile}`));
    });
  });

  const stop = () =>
    new Promise((resolve) => {
      if (child.exitCode !== null) {
        resolve();
        return;
      }
      const force = setTimeout(() => process.kill(child.pid, 'SIGKILL'), 10_000);
      child.once('exit', () => {
        clearTimeout(force);
        log.end();
        resolve();
      });
      process.kill(child.pid, 'SIGTERM');
    });

  return { url, pid: child.pid, cli: installed, stop };
}
