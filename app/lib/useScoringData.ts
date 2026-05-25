import { useState, useEffect, useCallback } from "react";
import type { ScoringData, Column, Row } from "./types";
import { DEFAULT_DATA } from "./types";

const STORAGE_KEY = "scoring-system-data";

function loadFromStorage(): ScoringData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as ScoringData;
    // backfill rowLabel / avgLabel / weights for existing data that predates these fields
    if (!parsed.rowLabel) parsed.rowLabel = "Provider";
    if (!parsed.avgLabel) parsed.avgLabel = "Avg";
    if (!parsed.weights) parsed.weights = {};
    return parsed;
  } catch {
    return DEFAULT_DATA;
  }
}

function saveToStorage(data: ScoringData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function distributeWeights(columns: Column[]): Record<string, number> {
  if (columns.length === 0) return {};
  const raw = 100 / columns.length;
  const rounded = Math.round(raw * 100) / 100; // 2 decimal places
  const weights: Record<string, number> = {};
  let assigned = 0;
  columns.forEach((col, idx) => {
    if (idx === columns.length - 1) {
      // Last column gets the remainder to guarantee sum = 100
      weights[col.id] = Math.round((100 - assigned) * 100) / 100;
    } else {
      weights[col.id] = rounded;
      assigned += rounded;
    }
  });
  return weights;
}

export function useScoringData() {
  const [data, setData] = useState<ScoringData>(DEFAULT_DATA);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadFromStorage());
    setHydrated(true);
  }, []);

  const update = useCallback((updater: (prev: ScoringData) => ScoringData) => {
    setData((prev) => {
      const next = updater(prev);
      saveToStorage(next);
      return next;
    });
  }, []);

  // ── Columns ──────────────────────────────────────────────────────────────

  const addColumn = useCallback(
    (name: string) => {
      update((prev) => {
        const newCol = { id: crypto.randomUUID(), name };
        const newColumns = [...prev.columns, newCol];
        return {
          ...prev,
          columns: newColumns,
          weights: distributeWeights(newColumns),
        };
      });
    },
    [update],
  );

  const renameColumn = useCallback(
    (id: string, name: string) => {
      update((prev) => ({
        ...prev,
        columns: prev.columns.map((c) => (c.id === id ? { ...c, name } : c)),
      }));
    },
    [update],
  );

  const deleteColumn = useCallback(
    (id: string) => {
      update((prev) => {
        const scores = { ...prev.scores };
        const notes = { ...prev.notes };
        for (const rowId of Object.keys(scores)) {
          const rowScores = { ...scores[rowId] };
          delete rowScores[id];
          scores[rowId] = rowScores;
        }
        for (const rowId of Object.keys(notes)) {
          const rowNotes = { ...notes[rowId] };
          delete rowNotes[id];
          notes[rowId] = rowNotes;
        }
        const newColumns = prev.columns.filter((c) => c.id !== id);
        return {
          ...prev,
          columns: newColumns,
          scores,
          notes,
          weights: distributeWeights(newColumns),
        };
      });
    },
    [update],
  );

  const moveColumn = useCallback(
    (id: string, direction: "up" | "down") => {
      update((prev) => {
        const cols = [...prev.columns];
        const idx = cols.findIndex((c) => c.id === id);
        if (idx === -1) return prev;
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= cols.length) return prev;
        [cols[idx], cols[swapIdx]] = [cols[swapIdx], cols[idx]];
        return { ...prev, columns: cols };
      });
    },
    [update],
  );

  // ── Rows ─────────────────────────────────────────────────────────────────

  const addRow = useCallback(
    (name: string) => {
      update((prev) => ({
        ...prev,
        rows: [...prev.rows, { id: crypto.randomUUID(), name }],
      }));
    },
    [update],
  );

  const renameRow = useCallback(
    (id: string, name: string) => {
      update((prev) => ({
        ...prev,
        rows: prev.rows.map((r) => (r.id === id ? { ...r, name } : r)),
      }));
    },
    [update],
  );

  const deleteRow = useCallback(
    (id: string) => {
      update((prev) => {
        const scores = { ...prev.scores };
        const notes = { ...prev.notes };
        delete scores[id];
        delete notes[id];
        return {
          ...prev,
          rows: prev.rows.filter((r) => r.id !== id),
          scores,
          notes,
        };
      });
    },
    [update],
  );

  const moveRow = useCallback(
    (id: string, direction: "up" | "down") => {
      update((prev) => {
        const rows = [...prev.rows];
        const idx = rows.findIndex((r) => r.id === id);
        if (idx === -1) return prev;
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= rows.length) return prev;
        [rows[idx], rows[swapIdx]] = [rows[swapIdx], rows[idx]];
        return { ...prev, rows };
      });
    },
    [update],
  );

  // ── Row label / Avg label ─────────────────────────────────────────────────

  const setRowLabel = useCallback(
    (label: string) => {
      update((prev) => ({ ...prev, rowLabel: label }));
    },
    [update],
  );

  const setAvgLabel = useCallback(
    (label: string) => {
      update((prev) => ({ ...prev, avgLabel: label }));
    },
    [update],
  );

  // ── Weights ───────────────────────────────────────────────────────────────

  const setWeights = useCallback(
    (weights: Record<string, number>) => {
      update((prev) => ({ ...prev, weights }));
    },
    [update],
  );

  // ── Scores & Notes ────────────────────────────────────────────────────────

  const setScore = useCallback(
    (rowId: string, colId: string, score: number | null) => {
      update((prev) => {
        const rowScores = { ...(prev.scores[rowId] ?? {}) };
        if (score === null) {
          delete rowScores[colId];
        } else {
          rowScores[colId] = score;
        }
        return { ...prev, scores: { ...prev.scores, [rowId]: rowScores } };
      });
    },
    [update],
  );

  const setNote = useCallback(
    (rowId: string, colId: string, note: string) => {
      update((prev) => {
        const rowNotes = { ...(prev.notes[rowId] ?? {}) };
        if (!note.trim()) {
          delete rowNotes[colId];
        } else {
          rowNotes[colId] = note;
        }
        return { ...prev, notes: { ...prev.notes, [rowId]: rowNotes } };
      });
    },
    [update],
  );

  // ── Import / Export ───────────────────────────────────────────────────────

  const replaceAll = useCallback((newData: ScoringData) => {
    saveToStorage(newData);
    setData(newData);
  }, []);

  return {
    data,
    hydrated,
    addColumn,
    renameColumn,
    deleteColumn,
    moveColumn,
    addRow,
    renameRow,
    deleteRow,
    moveRow,
    setRowLabel,
    setAvgLabel,
    setWeights,
    setScore,
    setNote,
    replaceAll,
  };
}
