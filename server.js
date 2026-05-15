const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "";
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1024 * 1024) {
        reject(new Error("Payload muito grande"));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("JSON invalido"));
      }
    });
  });
}

async function proxyChat(request, response) {
  if (!n8nWebhookUrl) {
    sendJson(response, 200, {
      resposta: "",
      usandoN8n: false,
    });
    return;
  }

  try {
    const payload = await readJsonBody(request);
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await n8nResponse.text();

    response.writeHead(n8nResponse.status, {
      "Content-Type": n8nResponse.headers.get("content-type") || "application/json; charset=utf-8",
    });
    response.end(text);
  } catch (error) {
    sendJson(response, 502, {
      error: "Nao foi possivel consultar o n8n.",
    });
  }
}

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url.split("?")[0] === "/config.js") {
    response.writeHead(200, {
      "Content-Type": "text/javascript; charset=utf-8",
    });
    response.end(`window.CHATBOT_CONFIG = ${JSON.stringify({ useN8n: Boolean(n8nWebhookUrl) })};`);
    return;
  }

  if (request.method === "POST" && request.url.split("?")[0] === "/api/chat") {
    proxyChat(request, response);
    return;
  }

  const urlPath = decodeURIComponent(request.url.split("?")[0]);
  const requestedFile = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const filePath = path.resolve(root, requestedFile);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`Chatbot Escolar rodando em http://${host}:${port}`);
});
