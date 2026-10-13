import { useEffect, useState } from "react";
import { DilRoot } from "./DilRoot.jsx";
import { documentFor, suggestions } from "./demo.js";
import { useDilStream } from "./useDilStream.js";

export function App() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [generation, setGeneration] = useState(0);
  const [pending, setPending] = useState(false);
  const active = [...messages].reverse().find((message) => message.role === "assistant");
  const stream = useDilStream(active?.doc ?? null, generation);

  async function ask(text) {
    const prompt = text.trim();
    if (!prompt || pending) return;
    setDraft("");
    setPending(true);
    setGeneration((value) => value + 1);
    const doc = await documentFromApi(prompt);
    setPending(false);
    setMessages((current) => [
      ...current,
      { role: "user", text: prompt },
      doc.errors
        ? { role: "error", text: doc.errors.join(" ") }
        : { role: "assistant", doc: doc.document },
    ]);
  }

  useEffect(() => {
    let after = 0;
    let busy = false;
    const timer = window.setInterval(async () => {
      if (busy) return;
      busy = true;
      try {
        const response = await fetch(`/api/inbox?after=${after}`);
        if (response.status === 200) {
          const body = await response.json();
          if (body.id > after) {
            after = body.id;
            setGeneration((value) => value + 1);
            setMessages((current) => [
              ...current,
              { role: "user", text: body.prompt },
              { role: "assistant", doc: body.document },
            ]);
          }
        }
      } catch {
        /* The replica still works when no agent is pushing. */
      } finally {
        busy = false;
      }
    }, 1200);
    return () => window.clearInterval(timer);
  }, []);

  function reset() {
    setMessages([]);
    setDraft("");
    setGeneration((value) => value + 1);
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <button type="button" className="new-chat" onClick={reset}>
          New chat
        </button>
        <p className="side-note">POST /api/complete</p>
      </aside>
      <main className="stage">
        <div className="thread">
          {messages.length === 0 ? (
            <div className="empty">
              <h1>Where should we begin?</h1>
              <div className="suggestion-row">
                {suggestions.map((item) => (
                  <button key={item.label} type="button" onClick={() => ask(item.prompt)}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) =>
              message.role === "user" ? (
                <div key={index} className="user-turn">
                  <p>{message.text}</p>
                </div>
              ) : message.role === "error" ? (
                <p key={index} className="api-error" role="alert">
                  {message.text}
                </p>
              ) : (
                <DilRoot
                  key={index}
                  doc={message.doc}
                  blockIndex={message === active ? stream.blockIndex : message.doc.blocks.length}
                  words={message === active ? stream.words : 999}
                  onPick={ask}
                />
              ),
            )
          )}
        </div>
        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            ask(draft);
          }}
        >
          <label className="sr-only" htmlFor="prompt">
            Chat with ChatGPT
          </label>
          <textarea
            id="prompt"
            rows={1}
            placeholder="Ask ChatGPT"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                ask(draft);
              }
            }}
          />
          <button type="submit" disabled={pending || !draft.trim()} aria-label="Send message">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 19V5M12 5l-6 6M12 5l6 6" />
            </svg>
          </button>
        </form>
      </main>
    </div>
  );
}

async function documentFromApi(prompt) {
  try {
    const response = await fetch("/api/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (response.status === 404) return { document: documentFor(prompt) };
    const body = await response.json();
    if (!response.ok) return { errors: body.errors ?? ["The local API rejected this turn."] };
    return { document: body.document };
  } catch {
    return { document: documentFor(prompt) };
  }
}
