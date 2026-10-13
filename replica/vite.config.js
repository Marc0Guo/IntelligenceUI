import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { completeTurn, pushInbox, readInbox, schema } from "./src/api.js";

function dilApi() {
  const handle = (req, res, next) => {
    const url = req.url?.split("?")[0];
    if (url === "/api/schema" && req.method === "GET") {
      send(res, 200, schema);
      return;
    }
    if (url === "/api/inbox" && req.method === "GET") {
      const after = new URL(req.url, "http://localhost").searchParams.get("after");
      const result = readInbox(after);
      if (result.status === 204) {
        res.statusCode = 204;
        res.end();
        return;
      }
      send(res, 200, result);
      return;
    }
    if (url === "/api/inbox" && req.method === "POST") {
      readJson(req)
        .then((body) => {
          const result = pushInbox(body);
          send(res, result.status, result.errors ? { errors: result.errors } : { id: result.id, document: result.document });
        })
        .catch(() => send(res, 400, { errors: ["Request body must be JSON."] }));
      return;
    }
    if (url === "/api/complete" && req.method === "POST") {
      readJson(req)
        .then((body) => {
          const result = completeTurn(body);
          send(res, result.status, result.errors ? { errors: result.errors } : { document: result.document });
        })
        .catch(() => send(res, 400, { errors: ["Request body must be JSON."] }));
      return;
    }
    next();
  };
  return {
    name: "dil-api",
    configureServer(server) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle);
    },
  };
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(text ? JSON.parse(text) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

export default defineConfig({
  plugins: [dilApi(), react()],
  server: { port: 5173, strictPort: true },
});
