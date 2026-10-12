// Local persistence layer exposing the same surface as Base44 entities
// (list / filter / get / create / update / delete). Swap this file for the
// Base44 SDK client to move to a real backend.
import { seed } from './seed';

const PREFIX = 'fitpulse:';
const SEEDED_KEY = `${PREFIX}seeded:v1`;

function read(name) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + name)) ?? [];
  } catch {
    return [];
  }
}

function write(name, rows) {
  localStorage.setItem(PREFIX + name, JSON.stringify(rows));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function sortRows(rows, sort) {
  if (!sort) return rows;
  const desc = sort.startsWith('-');
  const key = desc ? sort.slice(1) : sort;
  return [...rows].sort((a, b) => {
    if (a[key] === b[key]) return 0;
    return (a[key] > b[key] ? 1 : -1) * (desc ? -1 : 1);
  });
}

function makeEntity(name) {
  return {
    async list(sort) {
      return sortRows(read(name), sort);
    },
    async filter(query = {}, sort) {
      const rows = read(name).filter((r) => Object.entries(query).every(([k, v]) => r[k] === v));
      return sortRows(rows, sort);
    },
    async get(id) {
      return read(name).find((r) => r.id === id) ?? null;
    },
    async create(data) {
      const row = { ...data, id: uid(), created_date: new Date().toISOString() };
      write(name, [...read(name), row]);
      return row;
    },
    async update(id, data) {
      let updated = null;
      write(
        name,
        read(name).map((r) => (r.id === id ? (updated = { ...r, ...data, updated_date: new Date().toISOString() }) : r)),
      );
      return updated;
    },
    async delete(id) {
      write(name, read(name).filter((r) => r.id !== id));
    },
  };
}

function ensureSeeded() {
  if (localStorage.getItem(SEEDED_KEY)) return;
  for (const [name, rows] of Object.entries(seed)) {
    if (read(name).length === 0) write(name, rows.map((r) => ({ ...r, id: uid() })));
  }
  localStorage.setItem(SEEDED_KEY, '1');
}

ensureSeeded();

export const UserProfile = makeEntity('UserProfile');
export const Food = makeEntity('Food');
export const FoodLog = makeEntity('FoodLog');
export const Workout = makeEntity('Workout');
export const WorkoutLog = makeEntity('WorkoutLog');
export const Recipe = makeEntity('Recipe');
