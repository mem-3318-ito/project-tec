import { readFile, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const srcDir = resolve("src");
const errors = [];

async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(path)));
    else result.push(path);
  }
  return result;
}

function report(file, message) {
  errors.push(`${file}: ${message}`);
}

function checkHtml(file, source) {
  if (/\sstyle\s*=\s*["']/i.test(source))
    report(file, "inline style is not allowed");
  if (/\son[a-z]+\s*=\s*["']/i.test(source))
    report(file, "inline event handlers are not allowed");
  if (/<iframe\b/i.test(source))
    report(file, "iframe is not allowed for component composition");
}

function checkCss(file, source) {
  const blocks = source.split("{");
  for (let index = 0; index < blocks.length - 1; index += 1) {
    const candidate = blocks[index].split("}").at(-1)?.trim() ?? "";
    if (!candidate || candidate.startsWith("@")) continue;
    if (/\.slds-[a-z0-9_-]+/i.test(candidate)) {
      report(
        file,
        `do not target SLDS selectors directly: ${candidate.replace(/\s+/g, " ")}`,
      );
    }
    if (/(^|[\s>,+~])#[a-z][\w-]*/i.test(candidate)) {
      report(
        file,
        `CSS ID selector is not allowed: ${candidate.replace(/\s+/g, " ")}`,
      );
    }
  }
}

function checkJs(file, source) {
  if (/\bgetElementById\s*\(/.test(source))
    report(
      file,
      "getElementById is not allowed; use component-scoped data-* hooks",
    );
  if (/querySelector(?:All)?\s*\(\s*["'][^"']*#[^"']*["']/.test(source)) {
    report(
      file,
      "#id query selectors are not allowed; use component-scoped data-* hooks",
    );
  }
}

for (const file of await walk(srcDir)) {
  const source = await readFile(file, "utf8");
  switch (extname(file)) {
    case ".html":
      checkHtml(file, source);
      break;
    case ".css":
      checkCss(file, source);
      break;
    case ".js":
      checkJs(file, source);
      break;
  }
}

if (errors.length > 0) {
  console.error("Project rule violations:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Project rules: OK");
}
