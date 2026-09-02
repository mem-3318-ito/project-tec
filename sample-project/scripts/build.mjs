import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import posthtml from "posthtml";
import include from "posthtml-include";

const rootDir = resolve(".");
const srcDir = join(rootDir, "src");
const pagesDir = join(srcDir, "pages");
const componentsDir = join(srcDir, "components");
const distDir = join(rootDir, "dist");

const includePattern = /<include\s+src=["']([^"']+)["'][^>]*>(?:<\/include>)?/g;

async function pathExists(path) {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

async function collectIncludes(filePath, stack = []) {
  const normalized = resolve(filePath);
  if (stack.includes(normalized)) {
    throw new Error(`Circular include detected: ${[...stack, normalized].join(" -> ")}`);
  }

  const source = await readFile(normalized, "utf8");
  const includes = [];
  for (const match of source.matchAll(includePattern)) {
    const includePath = resolve(srcDir, match[1]);
    const nested = await collectIncludes(includePath, [...stack, normalized]);
    includes.push(includePath, ...nested);
  }
  return includes;
}

function unique(items) {
  return [...new Set(items)];
}

function componentAssetPath(htmlPath, extension) {
  if (!htmlPath.startsWith(componentsDir)) {
    return null;
  }
  return htmlPath.replace(/\.html$/, extension);
}

async function renderPage(pagePath) {
  const source = await readFile(pagePath, "utf8");
  const includeFiles = unique(await collectIncludes(pagePath));
  const cssFiles = [];
  const jsFiles = [];

  for (const includeFile of includeFiles) {
    const cssFile = componentAssetPath(includeFile, ".css");
    const jsFile = componentAssetPath(includeFile, ".js");
    if (cssFile && (await pathExists(cssFile))) cssFiles.push(cssFile);
    if (jsFile && (await pathExists(jsFile))) jsFiles.push(jsFile);
  }

  const styleTags = unique(cssFiles)
    .map((file) => {
      const webPath = relative(srcDir, file).split("\\").join("/");
      return `    <link rel="stylesheet" href="./${webPath}" />`;
    })
    .join("\n");

  const scriptTags = unique(jsFiles)
    .map((file) => {
      const webPath = relative(srcDir, file).split("\\").join("/");
      return `    <script type="module" src="./${webPath}"></script>`;
    })
    .join("\n");

  const withAssets = source
    .replace("    <!-- component-styles -->", styleTags)
    .replace("    <!-- component-scripts -->", scriptTags);

  const result = await posthtml([
    include({
      root: srcDir,
      encoding: "utf8"
    })
  ]).process(withAssets);

  return result.html;
}

async function copyIfExists(source, destination) {
  try {
    await cp(source, destination, { recursive: true });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

const pageEntries = await readdir(pagesDir, { withFileTypes: true });
for (const entry of pageEntries) {
  if (!entry.isFile() || extname(entry.name) !== ".html") continue;
  const pagePath = join(pagesDir, entry.name);
  const html = await renderPage(pagePath);
  await writeFile(join(distDir, entry.name), html, "utf8");
}

await copyIfExists(join(srcDir, "styles"), join(distDir, "styles"));
await copyIfExists(join(srcDir, "scripts"), join(distDir, "scripts"));
await copyIfExists(join(srcDir, "assets"), join(distDir, "assets"));

for (const entry of await readdir(componentsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const sourceDir = join(componentsDir, entry.name);
  const destinationDir = join(distDir, "components", entry.name);
  await mkdir(destinationDir, { recursive: true });
  for (const asset of await readdir(sourceDir, { withFileTypes: true })) {
    if (!asset.isFile() || ![".css", ".js"].includes(extname(asset.name))) continue;
    await cp(join(sourceDir, asset.name), join(destinationDir, asset.name));
  }
}

const sldsCss = join(
  rootDir,
  "node_modules",
  "@salesforce-ux",
  "design-system",
  "assets",
  "styles",
  "salesforce-lightning-design-system.min.css"
);
const sldsDestination = join(distDir, "vendor", "slds", "salesforce-lightning-design-system.min.css");
await mkdir(dirname(sldsDestination), { recursive: true });
await cp(sldsCss, sldsDestination);

console.log("Built static pages into dist/");
