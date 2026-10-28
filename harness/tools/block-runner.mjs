// d. Block Runner: the pinned npm package, built-in rules only (`convert`),
// run on the host. Its output markup is saved as each page's content.

import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { insertPagesPhp } from './common.mjs';

// Node ^22.23.4 || ^24.22.1 || >=26.12.1 (block-runner@1.0.0 engines).
export function nodeSupported([major, minor, patch]) {
  const atLeast = (m, p) => minor > m || (minor === m && patch >= p);
  if (major === 22) return atLeast(23, 4);
  if (major === 24) return atLeast(22, 1);
  if (major === 26) return atLeast(12, 1);
  return major > 26;
}

export default {
  id: 'block-runner',
  async prepare(ctx) {
    const version = process.versions.node.split('.').map(Number);
    if (!nodeSupported(version)) {
      throw new Error(`block-runner@${ctx.tool.version} needs Node ${ctx.tool.node_engines}; this is ${process.version}.`);
    }
    for (const name of ctx.pages) {
      const input = path.join(ctx.work, 'input', `${name}.html`);
      const output = path.join(ctx.work, 'out', `${name}.blocks.html`);
      let report;
      try {
        report = execFileSync('npx', ['-y', ctx.tool.npm, 'convert', input, '--out', output, '--json'], { encoding: 'utf8' });
      } catch (error) {
        // A non-zero exit is the tool's verdict; keep its report and go on.
        report = `${error.stdout ?? ''}${error.stderr ?? ''}`;
      }
      writeFileSync(path.join(ctx.work, 'out', `${name}.report.json`), report);
      if (!existsSync(output)) {
        // No output is a result too: the page is saved empty and scored as lost.
        writeFileSync(output, '');
      }
    }
    const contentFor = '$content = file_get_contents( "/harness/out/{$page}.blocks.html" );';
    return [{ step: 'runPHP', code: insertPagesPhp(ctx.pages, contentFor) }];
  },
};
