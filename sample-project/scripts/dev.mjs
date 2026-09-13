import { watch } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { spawn } from "node:child_process";

const HOME_PATH = "top.html";
const port = Number(process.env.PORT ?? 4173);
const distDir = resolve("dist");
let buildTimer;
let buildRunning = false;
let buildQueued = false;

function runBuild() {
  if (buildRunning) {
    buildQueued = true;
    return;
  }

  buildRunning = true;
  const child = spawn(process.execPath, ["scripts/build.mjs"], {
    stdio: "inherit",
  });
  child.on("exit", () => {
    buildRunning = false;
    if (buildQueued) {
      buildQueued = false;
      runBuild();
    }
  });
}

function scheduleBuild() {
  clearTimeout(buildTimer);
  buildTimer = setTimeout(runBuild, 120);
}

runBuild();
watch("src", { recursive: true }, scheduleBuild);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent((request.url ?? "/").split("?")[0]);
    const relativePath =
      requestPath === "/" ? HOME_PATH : requestPath.replace(/^\//, "");
    const safePath = normalize(relativePath);
    const filePath = join(distDir, safePath);

    if (!filePath.startsWith(`${distDir}${sep}`) && filePath !== distDir) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const fileStat = await stat(filePath);
    const finalPath = fileStat.isDirectory()
      ? join(filePath, "index.html")
      : filePath;
    const body = await readFile(finalPath);
    response.writeHead(200, {
      "Content-Type":
        mimeTypes[extname(finalPath)] ?? "application/octet-stream",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
  }
});

server.listen(port, () => {
  console.log(`Static server: http://localhost:${port}`);
});
