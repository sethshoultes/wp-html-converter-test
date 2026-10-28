// The whole input rule for page-content converters (TOOLS.md, "How inputs are given"):
// take the inner HTML of <body> and resolve every relative src and href against
// the page's address in the served copy. Nothing else is changed.

import { readFileSync } from 'node:fs';
import path from 'node:path';

const BODY = /<body[^>]*>([\s\S]*)<\/body>/i;
const URL_ATTR = /(\s(?:src|href)\s*=\s*)(["'])(.*?)\2/gi;

export function pageBody(sampleDir, page, servedBase) {
  const file = path.join(sampleDir, `${page}.html`);
  const html = readFileSync(file, 'utf8');
  const match = html.match(BODY);
  if (!match) {
    throw new Error(`No <body> in ${file}`);
  }
  const pageUrl = new URL(`${page}.html`, servedBase);
  return match[1].replace(URL_ATTR, (whole, lead, quote, value) => {
    if (value === '' || value.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//')) {
      return whole;
    }
    return `${lead}${quote}${new URL(value, pageUrl).href}${quote}`;
  });
}
