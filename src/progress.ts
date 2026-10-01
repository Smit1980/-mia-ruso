import { createEmptyCard, fsrs, Rating, type Card } from "ts-fsrs";
import { cards, lessons } from "./course";
export type Progress = {
  version: 1;
  completed: string[];
  reviews: Record<string, Card>;
};
const storageKey = "mia-progress-v1";
export const fresh = (): Progress => ({
  version: 1,
  completed: [],
  reviews: {},
});
export function parseProgress(raw: string): Progress {
  const p = JSON.parse(raw);
  if (
    !p ||
    p.version !== 1 ||
    !Array.isArray(p.completed) ||
    !p.reviews ||
    typeof p.reviews !== "object" ||
    Array.isArray(p.reviews)
  )
    throw Error("Archivo de progreso no válido.");
  if (
    p.completed.some(
      (id: unknown) =>
        typeof id !== "string" || !lessons.some((l) => l.id === id),
    )
  )
    throw Error("Lecciones no válidas.");
  for (const [id, value] of Object.entries(p.reviews)) {
    if (!cards.some((c) => c.id === id) || !value || typeof value !== "object")
      throw Error("Tarjeta no válida.");
    const c = value as Record<string, unknown>;
    for (const field of [
      "stability",
      "difficulty",
      "elapsed_days",
      "scheduled_days",
      "reps",
      "lapses",
      "state",
      "learning_steps",
    ])
      if (
        typeof c[field] !== "number" ||
        !Number.isFinite(c[field]) ||
        (c[field] as number) < 0
      )
        throw Error("Datos de repetición no válidos.");
    if (![0, 1, 2, 3].includes(c.state as number))
      throw Error("Estado no válido.");
    if (typeof c.due !== "string" || !Number.isFinite(Date.parse(c.due)))
      throw Error("Fecha no válida.");
    c.due = new Date(c.due);
    if (c.last_review !== undefined) {
      if (
        typeof c.last_review !== "string" ||
        !Number.isFinite(Date.parse(c.last_review))
      )
        throw Error("Fecha no válida.");
      c.last_review = new Date(c.last_review);
    }
  }
  return p;
}
export let progress: Progress;
try {
  progress = parseProgress(
    localStorage.getItem(storageKey) || JSON.stringify(fresh()),
  );
} catch {
  progress = fresh();
}
export function save() {
  localStorage.setItem(storageKey, JSON.stringify(progress));
}
export function complete(id: string) {
  if (!progress.completed.includes(id)) progress.completed.push(id);
  save();
}
export function importProgress(raw: string) {
  const next = parseProgress(raw);
  localStorage.setItem(storageKey, JSON.stringify(next));
  progress = next;
}
const scheduler = fsrs();
export function rate(
  id: string,
  rating: Rating.Again | Rating.Good | Rating.Easy,
) {
  const current = progress.reviews[id] || createEmptyCard();
  progress.reviews[id] = scheduler.next(current, new Date(), rating).card;
  save();
}
export function dueCards() {
  return cards.filter(
    (c) =>
      !progress.reviews[c.id] ||
      new Date(progress.reviews[c.id].due).getTime() <= Date.now(),
  );
}
