import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";

const drawings = new URL("../proposal/screens.html", import.meta.url);
const server = createServer(async (request, response) => {
  let url;
  let pathname;
  try {
    url = new URL(request.url || "/", "http://localhost");
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end("Invalid address.");
    return;
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("This preview is read-only.");
    return;
  }
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    response.writeHead(403).end("AI endpoints are disabled in this preview.");
    return;
  }
  try {
    if (pathname === "/screens" || pathname === "/screens/") {
      const html = await readFile(drawings);
      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(request.method === "HEAD" ? undefined : html);
      return;
    }
    const requestHeaders = {};
    for (const name of ["accept", "rsc", "next-router-state-tree", "next-router-prefetch", "next-router-segment-prefetch", "next-url"]) {
      const value = request.headers[name];
      if (typeof value === "string") requestHeaders[name] = value;
    }
    const upstream = await fetch(`http://127.0.0.1:3212${url.pathname}${url.search}`, {
      method: request.method,
      headers: requestHeaders,
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    const headers = { "Cache-Control": "no-store" };
    for (const name of ["content-type", "vary", "x-nextjs-postponed", "x-nextjs-stale-time"]) {
      const value = upstream.headers.get(name);
      if (value) headers[name] = value;
    }
    const location = upstream.headers.get("location");
    if (location) {
      const redirect = new URL(location, "http://127.0.0.1:3212");
      headers.Location = redirect.origin === "http://127.0.0.1:3212"
        ? `${redirect.pathname}${redirect.search}${redirect.hash}`
        : location;
    }
    response.writeHead(upstream.status, headers);
    if (request.method === "HEAD" || !upstream.body) {
      response.end();
      return;
    }
    const body = Readable.fromWeb(upstream.body);
    body.on("error", () => response.destroy());
    response.on("close", () => body.destroy());
    body.pipe(response);
  } catch {
    if (response.headersSent) response.destroy();
    else response.writeHead(503).end("The preview is starting. Try again shortly.");
  }
});
server.listen(3213, "127.0.0.1", () => {
  console.log("Read-only phone preview listening on port 3213; API routes are blocked.");
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
