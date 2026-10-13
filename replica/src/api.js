import { documentFor } from "./demo.js";
import { normalizeDocument, parseEmbeddedDocument, schema, validateDocument } from "./contract.js";

export { schema };

let inboxId = 0;
let inbox = null;

export function pushInbox(body) {
  const document = body?.document;
  const result = completeTurn({ document });
  if (result.status !== 200) return result;
  inboxId += 1;
  inbox = {
    id: inboxId,
    prompt: typeof body?.prompt === "string" && body.prompt.trim() ? body.prompt.trim() : "Agent reply",
    document: result.document,
  };
  return { status: 200, id: inbox.id, document: inbox.document };
}

export function readInbox(after) {
  const cursor = Number(after);
  if (!inbox || (Number.isFinite(cursor) && inbox.id <= cursor)) return { status: 204 };
  return { status: 200, id: inbox.id, prompt: inbox.prompt, document: inbox.document };
}

export function completeTurn(body) {
  if (body && typeof body === "object" && body.document) {
    const errors = validateDocument(body.document);
    if (errors.length) return { status: 400, errors };
    return { status: 200, document: normalizeDocument(body.document) };
  }
  if (body && typeof body.prompt === "string") {
    const embedded = parseEmbeddedDocument(body.prompt);
    const source = embedded ?? documentFor(body.prompt);
    const errors = validateDocument(source);
    if (errors.length) return { status: 400, errors };
    return { status: 200, document: normalizeDocument(source) };
  }
  return { status: 400, errors: ["Send { prompt } or { document }."] };
}
