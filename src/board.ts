export async function api(path: string, body?: unknown) {
  const res = await fetch(
    `/api/${path}`,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : undefined,
  );
  const data = await res.json();
  if (!res.ok) throw Error(data.error || "No se pudo conectar.");
  return data;
}
export const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
let timer: ReturnType<typeof setInterval> | undefined;
let generation = 0;
export function stopBoard() {
  generation++;
  if (timer) clearInterval(timer);
  timer = undefined;
}
export async function renderBoard(root: HTMLElement, role: string) {
  stopBoard();
  const current = generation;
  root.innerHTML = `<div class="page-heading"><div><span class="eyebrow">CERCA, AUNQUE ESTEMOS LEJOS</span><h1>Nuestro tablón <span>↗</span></h1><p>Un lugar para contar tu día y recibir una respuesta.</p></div><button id="new-topic" class="primary">＋ Nuevo mensaje</button></div><div class="board-grid"><aside class="panel"><h2>Conversaciones</h2><div id="topics"><p>Cargando…</p></div><button id="refresh" class="text-button">↻ Actualizar</button></aside><section class="panel" id="thread"></section></div><p id="board-status" role="status"></p>`;
  const list = root.querySelector<HTMLElement>("#topics")!,
    thread = root.querySelector<HTMLElement>("#thread")!,
    status = root.querySelector<HTMLElement>("#board-status")!;
  let selected: string | undefined,
    requestId = crypto.randomUUID(),
    draft = "",
    draftTitle = "",
    busy = false,
    lastSignature = "";
  const date = (n: number) =>
    new Date(n).toLocaleString("es-CR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  function form(isNew: boolean) {
    thread.innerHTML = `${isNew ? '<span class="eyebrow">DE TU MUNDO AL MÍO</span><h2>¿Qué quieres contar?</h2>' : "<h2>Responder</h2>"}<form id="message-form">${isNew ? `<label>Título<input name="title" maxlength="120" required placeholder="Hoy en Costa Rica…" value="${escape(draftTitle)}"></label>` : ""}<label>Tu mensaje<textarea name="body" rows="6" maxlength="4000" required placeholder="Puedes escribir en español o en inglés.">${escape(draft)}</textarea></label><p class="small">Solo tú y tu familia pueden leer estos mensajes.</p><button class="primary" type="submit">Enviar mensaje ↗</button><p id="form-error" role="alert"></p></form>`;
    bindForm(isNew);
  }
  function bindForm(isNew: boolean) {
    const f = thread.querySelector<HTMLFormElement>("#message-form")!;
    f.addEventListener("input", () => {
      draft = (f.elements.namedItem("body") as HTMLTextAreaElement).value;
      draftTitle =
        (f.elements.namedItem("title") as HTMLInputElement | null)?.value || "";
    });
    f.onsubmit = async (e) => {
      e.preventDefault();
      if (busy) return;
      busy = true;
      const button = f.querySelector<HTMLButtonElement>("button")!;
      button.disabled = true;
      const error = f.querySelector<HTMLElement>("#form-error")!;
      error.textContent = "";
      try {
        const result = await api(isNew ? "topics" : `topics/${selected}`, {
          title: draftTitle,
          body: draft,
          requestId,
        });
        draft = "";
        draftTitle = "";
        requestId = crypto.randomUUID();
        selected = result.id;
        lastSignature = "";
        busy = false;
        await refresh();
      } catch (e) {
        error.textContent =
          e instanceof Error
            ? e.message
            : "No se pudo enviar. Tu mensaje sigue aquí.";
      } finally {
        busy = false;
        button.disabled = false;
      }
    };
  }
  async function refresh() {
    try {
      const topics = (await api("topics")) as {
        id: string;
        title: string;
        updated: number;
        count: number;
      }[];
      if (!root.isConnected || generation !== current) return;
      list.innerHTML = topics.length
        ? topics
            .map(
              (t) =>
                `<button class="topic ${selected === t.id ? "selected" : ""}" data-id="${t.id}"><strong>${escape(t.title)}</strong><span>${date(t.updated)} · ${t.count} mensaje${t.count === 1 ? "" : "s"}</span></button>`,
            )
            .join("")
        : '<p class="muted">Todavía no hay mensajes. ¡Empieza una conversación!</p>';
      list.querySelectorAll<HTMLButtonElement>("[data-id]").forEach(
        (b) =>
          (b.onclick = () => {
            if (
              draft &&
              !confirm(
                "¿Quieres dejar este borrador y abrir otra conversación?",
              )
            )
              return;
            selected = b.dataset.id;
            draft = "";
            draftTitle = "";
            requestId = crypto.randomUUID();
            lastSignature = "";
            void refresh();
          }),
      );
      if (selected) {
        const t = await api(`topics/${selected}`);
        if (!root.isConnected || generation !== current) return;
        const signature = JSON.stringify(t.messages);
        if (signature !== lastSignature && !busy) {
          // Preserve the draft while new replies arrive.
          lastSignature = signature;
          thread.innerHTML = `<span class="eyebrow">NUESTRA CONVERSACIÓN</span><h2>${escape(t.title)}</h2><div class="messages">${t.messages.map((m: { author: string; body: string; created: number }) => `<article class="message ${m.author === role ? "own" : ""}"><div class="message-meta"><strong>${m.author === "mia" ? "Mía 🌱" : "Familia ♡"}</strong><time>${date(m.created)}</time></div><p>${escape(m.body)}</p></article>`).join("")}</div><form id="message-form"><label>Tu respuesta<textarea name="body" rows="4" maxlength="4000" required placeholder="Escribe aquí…">${escape(draft)}</textarea></label><button class="primary" type="submit">Enviar respuesta ↗</button><p id="form-error" role="alert"></p></form>`;
          bindForm(false);
        }
      }
      status.textContent = "Los mensajes se actualizan cada 15 segundos.";
    } catch (e) {
      status.textContent =
        e instanceof Error
          ? e.message
          : "Sin conexión. Pulsa Actualizar para volver a intentar.";
    }
  }
  root.querySelector<HTMLButtonElement>("#new-topic")!.onclick = () => {
    if (
      draft &&
      !confirm("¿Quieres dejar este borrador y escribir un mensaje nuevo?")
    )
      return;
    selected = undefined;
    draft = "";
    draftTitle = "";
    requestId = crypto.randomUUID();
    lastSignature = "";
    form(true);
  };
  root.querySelector<HTMLButtonElement>("#refresh")!.onclick = () =>
    void refresh();
  form(true);
  await refresh();
  if (generation !== current) return;
  timer = setInterval(() => void refresh(), 15000);
}
