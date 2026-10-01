import Reveal from "reveal.js";
import "reveal.js/dist/reveal.css";
import "./style.css";
import { lessons, cards, type Lesson } from "./course";
import { progress, complete, rate, dueCards, importProgress } from "./progress";
import { Rating } from "ts-fsrs";
import { api, escape, renderBoard, stopBoard } from "./board";
const app = document.querySelector<HTMLElement>("#app")!;
let role = "mia",
  deck: Reveal.Api | undefined;
const icons = { home: "⌂", learn: "▤", review: "✦", board: "♡", settings: "⚙" };
async function boot() {
  try {
    const me = await api("me");
    role = me.role;
    layout();
    navigate("home");
  } catch (e) {
    app.innerHTML = `<main class="welcome"><div class="brand">🌱 hola, ruso</div><span class="eyebrow">UN PEQUEÑO PASO, UN NUEVO MUNDO</span><h1>Tu jardín de<br><em>palabras rusas.</em></h1><p>Aprende a tu ritmo. Comparte tu día.<br>Y acércate a tu familia, palabra a palabra.</p><div class="panel"><h2>Entra con tu enlace personal</h2><p>No necesitas contraseña ni correo. Abre el enlace que tu familia preparó para ti.</p><p class="small" role="status">${escape(e instanceof Error ? e.message : "No se pudo conectar al servidor.")}</p><button id="retry" class="primary">Volver a intentar</button></div><p class="small">Una aventura en ruso, con ayuda en español.</p></main>`;
    app.querySelector("#retry")!.addEventListener("click", () => void boot());
  }
}
function layout() {
  app.innerHTML = `<aside class="sidebar"><a class="brand" href="#home">🌱 hola, ruso<span>MI JARDÍN DE PALABRAS</span></a><nav aria-label="Navegación">${[
    ["home", "Mi jardín"],
    ["learn", "Mis lecciones"],
    ["review", "Practicar"],
    ["board", "Nuestro tablón"],
  ]
    .map(
      ([id, label]) =>
        `<button data-nav="${id}"><span aria-hidden="true">${icons[id as keyof typeof icons]}</span>${label}</button>`,
    )
    .join(
      "",
    )}</nav><div class="sidebar-bottom"><p>Un poquito cada día.<br><strong>Un mundo más cerca.</strong></p><button data-nav="settings">⚙ Mi progreso</button><button id="logout">Salir</button></div></aside><div class="workspace"><header class="topbar"><span>ES → <strong>РУ</strong></span><span>${role === "mia" ? "Mía" : "Familia"} <span class="avatar">${role === "mia" ? "M" : "F"}</span></span></header><main id="content"></main><footer>Hecho para aprender y estar cerca. 🌿</footer></div>`;
  app
    .querySelectorAll<HTMLButtonElement>("[data-nav]")
    .forEach((b) => (b.onclick = () => navigate(b.dataset.nav!)));
  app.querySelector(".brand")!.addEventListener("click", (e) => {
    e.preventDefault();
    navigate("home");
  });
  app.querySelector("#logout")!.addEventListener("click", async () => {
    try {
      await api("logout", {});
      await boot();
    } catch {
      alert("No se pudo salir. Inténtalo otra vez.");
    }
  });
}
const content = () => document.querySelector<HTMLElement>("#content")!;
function navigate(page: string) {
  stopBoard();
  if (deck) {
    deck.destroy();
    deck = undefined;
  }
  app
    .querySelectorAll("[data-nav]")
    .forEach((b) =>
      b.classList.toggle("active", (b as HTMLElement).dataset.nav === page),
    );
  if (page === "home") home();
  else if (page === "learn") learn();
  else if (page === "review") review();
  else if (page === "board") void renderBoard(content(), role);
  else settings();
}
function lessonCards() {
  return lessons
    .map(
      (l, i) =>
        `<button class="lesson-card" data-lesson="${l.id}"><span class="lesson-icon color-${i % 3}">${l.icon}</span><span class="small">LECCIÓN ${String(i + 1).padStart(2, "0")}</span><h3>${l.title}</h3><p>${l.subtitle}</p><span class="lesson-foot">${l.words.length} palabras · 5–10 min <strong>${progress.completed.includes(l.id) ? "✓ Completada" : "Empezar →"}</strong></span></button>`,
    )
    .join("");
}
function bindLessons() {
  content()
    .querySelectorAll<HTMLButtonElement>("[data-lesson]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          lesson(lessons.find((l) => l.id === b.dataset.lesson)!)),
    );
}
function home() {
  const next =
    lessons.find((l) => !progress.completed.includes(l.id)) || lessons[0];
  content().innerHTML = `<div class="page-heading"><div><span class="eyebrow">TU PEQUEÑA AVENTURA DE HOY</span><h1>${role === "mia" ? "¡Hola, Mía!" : "¡Hola, familia!"} <span>☀</span></h1><p>Cada palabra es una semilla. Vamos a plantar algunas.</p></div><span class="pill">🌿 A tu ritmo</span></div><section class="hero"><div><span class="eyebrow">HOY ES UN BUEN DÍA PARA EMPEZAR</span><h2>Un idioma nuevo.<br>Un mundo más cerca.</h2><p>Descubre el ruso con pequeñas lecciones<br>y palabras que puedes usar de verdad.</p><button class="primary" id="continue">${progress.completed.length ? "Continuar aprendiendo" : "Mi primera lección"} →</button></div><div class="word-garden" aria-hidden="true"><div class="sun">☀</div><div class="floating-word one">Приве́т!<span>¡Hola!</span></div><div class="floating-word two">Спаси́бо<span>Gracias</span></div><div class="sprout">🌱</div><div class="garden-caption">Las palabras nos acercan.</div></div></section><section class="stats"><div><span>🌱</span><strong>${progress.completed.length} / ${lessons.length}</strong><small>lecciones completadas</small></div><div><span>✦</span><strong>${Object.keys(progress.reviews).length}</strong><small>palabras practicadas</small></div><div><span>♡</span><strong>Siempre cerca</strong><small>tu familia, en el tablón</small></div></section><div class="section-heading"><h2>Tu camino empieza aquí</h2><button id="all" class="text-button">Ver todas las lecciones →</button></div><div class="lesson-grid">${lessonCards()}</div><section class="board-callout"><span>✉</span><div><h3>¿Qué tal tu día?</h3><p>Comparte algo con tu familia en nuestro tablón.</p></div><button class="secondary" id="go-board">Escribir un mensaje ↗</button></section>`;
  content()
    .querySelector("#continue")!
    .addEventListener("click", () => lesson(next));
  content()
    .querySelector("#all")!
    .addEventListener("click", () => navigate("learn"));
  content()
    .querySelector("#go-board")!
    .addEventListener("click", () => navigate("board"));
  bindLessons();
}
function learn() {
  content().innerHTML = `<div class="page-heading"><div><span class="eyebrow">PASO A PASO</span><h1>Mis lecciones</h1><p>Elige una pequeña aventura. Puedes volver cuando quieras.</p></div></div><div class="lesson-grid">${lessonCards()}</div>`;
  bindLessons();
}
async function lesson(l: Lesson) {
  if (deck) {
    deck.destroy();
    deck = undefined;
  }
  stopBoard();
  content().innerHTML = `<button id="back" class="text-button">← Mis lecciones</button><div class="section-heading"><h1>${l.title}</h1><span class="pill">5–10 min</span></div><div class="slide-shell"><div class="reveal"><div class="slides"><section><span class="slide-icon">${l.icon}</span><h2>${l.title}</h2><p>${l.subtitle}</p><small>Usa las flechas para descubrir las palabras →</small></section><section><h2>Una pequeña pista</h2><p>${l.note}</p></section>${Array.from(
    { length: Math.ceil(l.words.length / 2) },
    (_, i) =>
      `<section><span class="eyebrow">TUS NUEVAS PALABRAS</span>${l.words
        .slice(i * 2, i * 2 + 2)
        .map(
          (w) =>
            `<div class="slide-word"><h2 lang="ru">${w.ru}</h2><p>${w.es}</p><small>Lectura aproximada: ${w.hint}</small></div>`,
        )
        .join("")}</section>`,
  ).join(
    "",
  )}<section><h2>¡Tu turno! ✦</h2><p>Ya conoces ${l.words.length} palabras nuevas.<br>Vamos a practicar un poquito.</p></section></div></div></div><div class="lesson-actions"><button id="prev" class="secondary">← Anterior</button><span id="slide-position" aria-live="polite"></span><button id="next" class="primary">Siguiente →</button></div><div class="panel" id="quiz"><span class="eyebrow">PRACTICA SIN PRISA</span><h2>Una palabra a la vez</h2><p>Recorre los slides y después prueba estas preguntas.</p><button id="start-quiz" class="primary">Practicar esta lección ✦</button></div>`;
  content()
    .querySelector("#back")!
    .addEventListener("click", () => navigate("learn"));
  deck = new Reveal(content().querySelector<HTMLElement>(".reveal")!, {
    embedded: true,
    hash: false,
    controls: false,
    progress: true,
    center: true,
    width: 900,
    height: 500,
    transition: "fade",
    keyboardCondition: "focused",
  });
  await deck.initialize();
  const update = () => {
    const i = deck!.getIndices().h;
    const total = deck!.getTotalSlides();
    content().querySelector("#slide-position")!.textContent =
      `${i + 1} / ${total}`;
    (content().querySelector("#prev") as HTMLButtonElement).disabled = i === 0;
    (content().querySelector("#next") as HTMLButtonElement).disabled =
      i === total - 1;
  };
  deck.on("slidechanged", update);
  update();
  content()
    .querySelector("#prev")!
    .addEventListener("click", () => deck!.prev());
  content()
    .querySelector("#next")!
    .addEventListener("click", () => deck!.next());
  content()
    .querySelector("#start-quiz")!
    .addEventListener("click", () => quiz(l));
}
function quiz(l: Lesson) {
  let index = 0;
  const questions = l.words.slice(0, 3);
  const root = content().querySelector<HTMLElement>("#quiz")!;
  function draw() {
    if (index === questions.length) {
      try {
        complete(l.id);
        root.innerHTML =
          '<h2>¡Buen trabajo! 🌱</h2><p>Tu lección está completada. Vuelve a las tarjetas para recordar tus palabras.</p><button id="practice" class="primary">Ir a las tarjetas →</button>';
        root
          .querySelector("#practice")!
          .addEventListener("click", () => navigate("review"));
      } catch {
        root.innerHTML =
          '<p role="alert">No se pudo guardar el progreso. Revisa el espacio del navegador.</p>';
      }
      return;
    }
    const word = questions[index];
    const typed = index === 2;
    root.innerHTML = `<span class="eyebrow">PREGUNTA ${index + 1} DE ${questions.length}</span><h2>${typed ? `Escribe en ruso: «${word.es}»` : `¿Qué significa «${word.ru}»?`}</h2>${
      typed
        ? `<form id="answer-form"><label>Tu respuesta<input id="answer" required autocomplete="off" lang="ru"></label><div class="russian-keyboard" aria-label="Teclado ruso">${[..."абвгдеёжзийклмнопрстуфхцчшщъыьэюя"].map((letter) => `<button type="button" class="letter-key" data-letter="${letter}">${letter}</button>`).join("")}<button type="button" class="letter-key" data-letter=" ">Espacio</button><button type="button" class="letter-key" id="delete-letter">⌫</button></div><button class="primary">Comprobar</button></form><button id="hint" class="text-button">Mostrar pista</button><p id="hint-text"></p>`
        : `<div class="answers">${[
            word,
            ...l.words.filter((w) => w.ru !== word.ru).slice(0, 2),
          ]
            .sort((a, b) => a.es.localeCompare(b.es))
            .map(
              (w) =>
                `<button class="secondary" data-answer="${escape(w.es)}">${w.es}</button>`,
            )
            .join("")}</div>`
    }<p id="feedback" role="status"></p><button id="next-question" class="primary" hidden>Siguiente →</button>`;
    const check = (correct: boolean) => {
      root.querySelector("#feedback")!.textContent = correct
        ? "¡Sí! Muy bien. 🌱"
        : `Casi. La respuesta es: ${word.ru} — ${word.es}. Inténtalo otra vez.`;
      if (correct) {
        root.querySelector<HTMLButtonElement>("#next-question")!.hidden = false;
        root
          .querySelectorAll<HTMLButtonElement>(
            "[data-answer], #answer-form button",
          )
          .forEach((b) => (b.disabled = true));
      }
    };
    root
      .querySelectorAll<HTMLButtonElement>("[data-answer]")
      .forEach((b) => (b.onclick = () => check(b.dataset.answer === word.es)));
    if (typed) {
      const input = root.querySelector<HTMLInputElement>("#answer")!;
      root.querySelectorAll<HTMLButtonElement>("[data-letter]").forEach(
        (b) =>
          (b.onclick = () => {
            const start = input.selectionStart ?? input.value.length,
              end = input.selectionEnd ?? start;
            input.setRangeText(b.dataset.letter!, start, end, "end");
            input.focus();
          }),
      );
      root.querySelector("#delete-letter")!.addEventListener("click", () => {
        const end = input.selectionEnd ?? input.value.length,
          start = input.selectionStart ?? end;
        input.setRangeText(
          "",
          start === end ? Math.max(0, start - 1) : start,
          end,
          "end",
        );
        input.focus();
      });
      const normal = (s: string) =>
        s
          .normalize("NFD")
          .replace(/\u0301/g, "")
          .trim()
          .toLowerCase()
          .replace(/[.!?]/g, "");
      root.querySelector<HTMLFormElement>("#answer-form")!.onsubmit = (e) => {
        e.preventDefault();
        check(
          normal((root.querySelector("#answer") as HTMLInputElement).value) ===
            normal(word.ru),
        );
      };
      root
        .querySelector("#hint")!
        .addEventListener(
          "click",
          () =>
            (root.querySelector("#hint-text")!.textContent =
              `${word.ru} · ${word.hint}`),
        );
    }
    root.querySelector("#next-question")!.addEventListener("click", () => {
      index++;
      draw();
    });
  }
  draw();
  root.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function review() {
  let queue = dueCards().slice(0, 10),
    index = 0;
  const root = content();
  function draw() {
    if (index === queue.length) {
      root.innerHTML = `<div class="page-heading"><div><span class="eyebrow">PEQUEÑOS PASOS, GRANDES RECUERDOS</span><h1>¡Por hoy, muy bien! 🌱</h1><p>${queue.length ? "Terminaste esta ronda." : "No tienes tarjetas pendientes ahora."} Vuelve más tarde para seguir practicando.</p></div></div><button id="home" class="primary">Volver a mi jardín</button>`;
      root
        .querySelector("#home")!
        .addEventListener("click", () => navigate("home"));
      return;
    }
    const c = queue[index];
    root.innerHTML = `<div class="page-heading"><div><span class="eyebrow">UN POQUITO CADA DÍA</span><h1>Haz crecer tus palabras ✦</h1><p>Mira la palabra. ¿Recuerdas lo que significa?</p></div><span class="pill">${index + 1} / ${queue.length}</span></div><div class="flashcard"><span class="eyebrow">${lessons.find((l) => l.id === c.lesson)!.title}</span><h2 lang="ru">${c.ru}</h2><div id="translation" hidden><h3>${c.es}</h3><p>Lectura aproximada: ${c.hint}</p></div><button id="flip" class="primary">Ver significado ↻</button></div><div id="ratings" class="rating-buttons" hidden><button class="secondary" data-rate="1">Otra vez</button><button class="primary" data-rate="3">Lo recordé</button><button class="secondary" data-rate="4">Muy fácil</button></div><p class="center small">Las palabras volverán cuando sea un buen momento para repasarlas.</p>`;
    root.querySelector("#flip")!.addEventListener("click", () => {
      root.querySelector<HTMLElement>("#translation")!.hidden = false;
      root.querySelector<HTMLElement>("#ratings")!.hidden = false;
      root.querySelector<HTMLElement>("#flip")!.hidden = true;
    });
    root.querySelectorAll<HTMLButtonElement>("[data-rate]").forEach(
      (b) =>
        (b.onclick = () => {
          try {
            rate(
              c.id,
              Number(b.dataset.rate) as
                Rating.Again | Rating.Good | Rating.Easy,
            );
            index++;
            draw();
          } catch {
            alert("No se pudo guardar el progreso en este navegador.");
          }
        }),
    );
  }
  draw();
}
function settings() {
  content().innerHTML = `<div class="page-heading"><div><span class="eyebrow">TU CAMINO, GUARDADO</span><h1>Mi progreso</h1><p>Se guarda en este navegador. Lleva una copia a otro dispositivo.</p></div></div><section class="panel"><h2>Una copia de tus palabras</h2><p>Guarda un archivo de progreso para conservar tus lecciones y tarjetas. Los mensajes del tablón se guardan por separado en el servidor.</p><button id="export" class="primary">Descargar mi progreso ↓</button><label class="file-label">Importar una copia<input id="import" type="file" accept="application/json,.json"></label><p id="import-status" role="status"></p></section><section class="panel"><h2>Lo que ya has aprendido</h2><p>${progress.completed.length} lecciones completadas · ${Object.keys(progress.reviews).length} tarjetas practicadas · ${cards.length} tarjetas disponibles.</p><p class="small">Si borras los datos del navegador, perderás este progreso sin una copia. Los audios y la dictación llegarán en una siguiente etapa.</p></section>`;
  content()
    .querySelector("#export")!
    .addEventListener("click", () => {
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(progress, null, 2)], {
          type: "application/json",
        }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "mia-progreso.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  content().querySelector<HTMLInputElement>("#import")!.onchange = async (
    e,
  ) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const status = content().querySelector("#import-status")!;
    try {
      if (f.size > 1000000) throw Error("El archivo es demasiado grande.");
      if (!confirm("¿Reemplazar el progreso de este navegador con esta copia?"))
        return;
      importProgress(await f.text());
      status.textContent = "¡Tu progreso está listo!";
    } catch (e) {
      status.textContent =
        e instanceof Error ? e.message : "No se pudo importar.";
    }
  };
}
void boot();
