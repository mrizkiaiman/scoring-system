import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/table";
import { ScoreCell } from "../components/ScoreCell";
import { useScoringData } from "../lib/useScoringData";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../components/ui/tooltip";
import {
  LayoutDashboard,
  TableIcon,
  Info,
  Pencil,
  Check,
  X,
} from "lucide-react";

const SCORE_COLORS: Record<number, string> = {
  1: "bg-red-50 text-red-600 ring-1 ring-red-200",
  2: "bg-orange-50 text-orange-600 ring-1 ring-orange-200",
  3: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
  4: "bg-lime-50 text-lime-700 ring-1 ring-lime-200",
  5: "bg-green-50 text-green-700 ring-1 ring-green-200",
};

function getAverageColor(avg: number): string {
  if (avg >= 4.5) return "bg-green-50 text-green-700 ring-1 ring-green-200";
  if (avg >= 3.5) return "bg-lime-50 text-lime-700 ring-1 ring-lime-200";
  if (avg >= 2.5) return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200";
  if (avg >= 1.5) return "bg-orange-50 text-orange-600 ring-1 ring-orange-200";
  return "bg-red-50 text-red-600 ring-1 ring-red-200";
}

// ── Editable table header ─────────────────────────────────────────────────────

function EditableHeader({
  value,
  onSave,
  align = "left",
}: {
  value: string;
  onSave: (v: string) => void;
  align?: "left" | "center";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  const baseClass = "text-xs font-semibold text-white uppercase tracking-wider";

  if (editing) {
    return (
      <div
        className={`flex items-center gap-1 ${align === "center" ? "justify-center" : ""}`}
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          className={`bg-white border border-zinc-300 rounded-md px-2 py-0.5 text-xs font-semibold text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-400 w-28 ${align === "center" ? "text-center" : ""}`}
        />
        <button
          onClick={commit}
          className="text-emerald-500 hover:text-emerald-600 shrink-0 cursor-pointer"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          onClick={cancel}
          className="text-zinc-400 hover:text-zinc-600 shrink-0 cursor-pointer"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={`group/hdr flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors ${baseClass} ${align === "center" ? "justify-center w-full" : ""}`}
    >
      <span>{value}</span>
      <Pencil className="h-2.5 w-2.5 opacity-0 group-hover/hdr:opacity-50 transition-opacity shrink-0" />
    </button>
  );
}

// ── Table page ────────────────────────────────────────────────────────────────

export function meta(_: Route.MetaArgs) {
  return [{ title: "Table" }];
}

export default function TablePage() {
  const { data, hydrated, setScore, setNote, setRowLabel, setAvgLabel } =
    useScoringData();

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-sm text-zinc-400">Loading…</div>
      </div>
    );
  }

  const { columns, rows, scores, notes, rowLabel, avgLabel, weights } = data;

  function getRowAverage(rowId: string): number | null {
    const rowScores = scores[rowId];
    if (!rowScores) return null;

    // Check if any weights are configured
    const hasWeights = columns.some((col) => (weights[col.id] ?? 0) > 0);

    if (hasWeights) {
      // Weighted average: only consider columns that have both a score and a weight
      let weightedSum = 0;
      let totalWeight = 0;
      for (const col of columns) {
        const score = rowScores[col.id];
        const weight = weights[col.id] ?? 0;
        if (typeof score === "number" && weight > 0) {
          weightedSum += score * weight;
          totalWeight += weight;
        }
      }
      if (totalWeight === 0) return null;
      return weightedSum / totalWeight;
    } else {
      // Simple average (fallback when no weights configured)
      const vals = Object.values(rowScores).filter(
        (v) => typeof v === "number",
      );
      if (vals.length === 0) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Page header ── */}
      <div className="px-16 pt-12 pb-10">
        <div className="flex items-center gap-2 mb-2">
          <TableIcon className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Scoring
          </span>
        </div>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
              Table
            </h1>
            <p className="text-sm text-zinc-400 mt-1.5">
              Click a cell to score · hover a score to see its note
            </p>
          </div>

          {/* Scale legend */}
          <div className="flex items-center gap-2 mt-1 border border-zinc-100 rounded-xl px-5 py-2.5 shrink-0">
            <Info className="h-3.5 w-3.5 text-white" />
            <span className="text-xs text-zinc-400 mr-1">Scale</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`inline-flex items-center justify-center h-5 w-5 rounded-md text-xs font-semibold ${SCORE_COLORS[n]}`}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="px-16 pb-28">
        {rows.length === 0 || columns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 border border-zinc-100 rounded-2xl">
            <p className="text-sm text-zinc-400">No data configured yet.</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="border-collapse text-sm w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900">
                    {/* Sticky first header — editable */}
                    <th className="sticky left-0 z-20 bg-zinc-900 border-r border-zinc-700 px-7 py-4 text-left min-w-[200px] whitespace-nowrap">
                      <EditableHeader
                        value={rowLabel}
                        onSave={setRowLabel}
                        align="left"
                      />
                    </th>

                    {columns.map((col) => (
                      <TooltipProvider key={col.id}>
                        <Tooltip>
                          <TooltipTrigger
                            render={<th />}
                            className="px-7 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider min-w-[150px] whitespace-nowrap border-r border-zinc-700/60 cursor-pointer hover:bg-zinc-800 transition-colors"
                          >
                            {col.name}
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            hideArrow
                            className="bg-white text-zinc-900 border border-zinc-900 rounded-md px-3 py-1.5 text-xs font-medium"
                          >
                            Weight: {weights[col.id] ?? 0}%
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}

                    {/* Sticky last header — editable */}
                    <th className="sticky right-0 z-20 bg-zinc-900 border-l border-zinc-700 px-7 py-4 min-w-[120px] whitespace-nowrap">
                      <EditableHeader
                        value={avgLabel}
                        onSave={setAvgLabel}
                        align="center"
                      />
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-50">
                  {rows.map((row) => {
                    const avg = getRowAverage(row.id);
                    return (
                      <tr
                        key={row.id}
                        className="group hover:bg-zinc-50/50 transition-colors"
                      >
                        {/* Sticky first cell */}
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-zinc-50/50 border-r border-zinc-100 px-7 py-5 font-semibold text-zinc-800 whitespace-nowrap transition-colors">
                          {row.name}
                        </td>

                        {columns.map((col) => (
                          <td
                            key={col.id}
                            className="px-5 py-3 border-r border-zinc-50 text-center"
                          >
                            <ScoreCell
                              score={scores[row.id]?.[col.id]}
                              note={notes[row.id]?.[col.id]}
                              onScoreChange={(val) =>
                                setScore(row.id, col.id, val)
                              }
                              onNoteChange={(val) =>
                                setNote(row.id, col.id, val)
                              }
                            />
                          </td>
                        ))}

                        {/* Sticky last cell — average */}
                        <td className="sticky right-0 z-10 bg-white group-hover:bg-zinc-50/50 border-l border-zinc-100 px-7 py-5 text-center transition-colors">
                          {avg !== null ? (
                            <span
                              className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-xs font-bold tabular-nums ${getAverageColor(avg)}`}
                            >
                              {avg.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-white">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        to="/dashboard"
        className="fixed bottom-7 right-7 z-50 cursor-pointer"
      >
        <div className="flex items-center gap-2 px-5 h-12 rounded-full bg-zinc-900 text-white text-sm font-medium shadow-xl hover:bg-zinc-700 transition-colors">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </div>
      </Link>
    </div>
  );
}
