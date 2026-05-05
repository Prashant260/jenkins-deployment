const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

const tasks = [
  { id: 1, title: "Create a frontend", completed: true },
  { id: 2, title: "Build a backend API", completed: true },
  { id: 3, title: "Deploy with Jenkins", completed: false },
];

const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body is too large"));
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function serveStaticFile(res, requestedPath) {
  const safePath = requestedPath === "/" ? "/index.html" : requestedPath;
  const filePath = path.normalize(path.join(publicDir, safePath));
  const relativePath = path.relative(publicDir, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { error: "Page not found" });
      return;
    }

    const extension = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
    });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/health" && req.method === "GET") {
    sendJson(res, 200, {
      status: "ok",
      message: "Backend is running",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (url.pathname === "/api/tasks" && req.method === "GET") {
    sendJson(res, 200, { tasks });
    return;
  }

  if (url.pathname === "/api/tasks" && req.method === "POST") {
    try {
      const body = await readRequestBody(req);
      const data = JSON.parse(body || "{}");
      const title = String(data.title || "").trim();

      if (!title) {
        sendJson(res, 400, { error: "Task title is required" });
        return;
      }

      const task = {
        id: Date.now(),
        title,
        completed: false,
      };

      tasks.push(task);
      sendJson(res, 201, { task });
    } catch (error) {
      sendJson(res, 400, { error: "Invalid request body" });
    }
    return;
  }

  if (req.method === "GET") {
    serveStaticFile(res, decodeURIComponent(url.pathname));
    return;
  }

  sendJson(res, 405, { error: "Method not allowed" });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
