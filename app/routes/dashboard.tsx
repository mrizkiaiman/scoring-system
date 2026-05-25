import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/dashboard";
import { Input } from "../components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useScoringData } from "../lib/useScoringData";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Pencil,
  Check,
  X,
  TableIcon,
  LayoutDashboard,
  Columns3,
  Rows3,
} from "lucide-react";
import type { Column, Row } from "../lib/types";
import { toast } from "sonner";

// ── List item ─────────────────────────────────────────────────────────────────

interface ListItemProps {
  label: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

function ListItem({
  label,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRename,
  onDelete,
}: ListItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);

  function commitRename() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== label) {
      onRename(trimmed);
      toast.success(`Renamed to "${trimmed}"`);
    }
    setEditing(false);
  }

  function cancelRename() {
    setDraft(label);
    setEditing(false);
  }

  return (
    <div className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100/70 hover:border-zinc-200 transition-all duration-150">
      {/* Reorder arrows */}
      <div className="flex flex-col gap-0 shrink-0">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="flex items-center justify-center h-4 w-4 rounded text-zinc-300 hover:text-zinc-600 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="flex items-center justify-center h-4 w-4 rounded text-zinc-300 hover:text-zinc-600 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Label / edit */}
      {editing ? (
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") cancelRename();
          }}
          className="h-7 text-sm flex-1 border-zinc-200 focus-visible:ring-1"
          autoFocus
        />
      ) : (
        <span className="flex-1 text-sm font-medium text-zinc-800 truncate">
          {label}
        </span>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        {editing ? (
          <>
            <button
              onClick={commitRename}
              className="flex items-center justify-center h-7 w-7 rounded-lg text-emerald-500 hover:bg-emerald-50 cursor-pointer transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={cancelRename}
              className="flex items-center justify-center h-7 w-7 rounded-lg text-zinc-400 hover:bg-zinc-100 cursor-pointer transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setDraft(label);
                setEditing(true);
              }}
              className="flex items-center justify-center h-7 w-7 rounded-lg text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 opacity-0 group-hover:opacity-100 cursor-pointer transition-all"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center h-7 w-7 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 cursor-pointer transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Add item ──────────────────────────────────────────────────────────────────

function AddItem({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (name: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleAdd() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
    toast.success(`"${trimmed}" added`);
  }

  return (
    <div className="flex gap-2 pt-1">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm bg-white border-zinc-200"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
        }}
      />
      <button
        onClick={handleAdd}
        className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 cursor-pointer transition-colors shrink-0"
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </button>
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  count,
  emptyText,
  addPlaceholder,
  children,
  onAdd,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  emptyText: string;
  addPlaceholder: string;
  children: React.ReactNode;
  onAdd: (name: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-3">
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-100 text-zinc-600">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {count} {count === 1 ? "item" : "items"}
          </p>
        </div>
      </div>
      <div className="px-5 py-4">
        {count === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-6">{emptyText}</p>
        ) : (
          <div className="flex flex-col gap-2 mb-4">{children}</div>
        )}
        <AddItem placeholder={addPlaceholder} onAdd={onAdd} />
      </div>
    </div>
  );
}

// ── Label input (reusable for rowLabel / avgLabel) ────────────────────────────

function LabelInput({
  value,
  onSave,
  placeholder,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value);

  // sync when value changes externally
  useState(() => {
    setDraft(value);
  });

  function handleSave() {
    const trimmed = draft.trim();
    if (trimmed) {
      onSave(trimmed);
      toast.success("Label saved");
    } else {
      setDraft(value);
    }
  }

  return (
    <>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
        }}
        className="h-9 text-sm bg-white border-zinc-200 max-w-xs"
        placeholder={placeholder ?? "Label…"}
      />
      <button
        onClick={handleSave}
        className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 cursor-pointer transition-colors shrink-0"
      >
        <Check className="h-3.5 w-3.5" />
        Save
      </button>
    </>
  );
}

// ── Dashboard page ────────────────────────────────────────────────────────────

export function meta(_: Route.MetaArgs) {
  return [{ title: "Dashboard" }];
}

export default function DashboardPage() {
  const {
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
  } = useScoringData();

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "column" | "row";
    item: Column | Row;
  } | null>(null);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-sm text-zinc-400">Loading…</div>
      </div>
    );
  }

  const { columns, rows, rowLabel, avgLabel } = data;

  function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.item.name;
    if (deleteTarget.type === "column") deleteColumn(deleteTarget.item.id);
    else deleteRow(deleteTarget.item.id);
    setDeleteTarget(null);
    toast.success(`"${name}" deleted`);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="px-10 pt-10 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard className="h-4 w-4 text-zinc-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Configuration
          </span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 mt-1.5">
          Manage the columns (criteria) and rows (providers) for your scoring
          table.
        </p>
      </div>

      {/* Column labels config */}
      <div className="px-10 mb-5 max-w-5xl">
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-100 text-zinc-600">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Column Labels
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Rename the sticky first and last columns in the table
              </p>
            </div>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1.5">
                First column (sticky left)
              </p>
              <div className="flex gap-2">
                <LabelInput
                  value={rowLabel}
                  onSave={setRowLabel}
                  placeholder="e.g. Provider, Tool…"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1.5">
                Last column (sticky right)
              </p>
              <div className="flex gap-2">
                <LabelInput
                  value={avgLabel}
                  onSave={setAvgLabel}
                  placeholder="e.g. Avg, Score, Total…"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="px-10 pb-24 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">
        <SectionCard
          icon={<Columns3 className="h-4 w-4" />}
          title="Columns"
          count={columns.length}
          emptyText="No columns yet. Add your first criterion below."
          addPlaceholder="e.g. Cost, Performance, Security…"
          onAdd={addColumn}
        >
          {columns.map((col, idx) => (
            <ListItem
              key={col.id}
              label={col.name}
              isFirst={idx === 0}
              isLast={idx === columns.length - 1}
              onMoveUp={() => moveColumn(col.id, "up")}
              onMoveDown={() => moveColumn(col.id, "down")}
              onRename={(name) => renameColumn(col.id, name)}
              onDelete={() => setDeleteTarget({ type: "column", item: col })}
            />
          ))}
        </SectionCard>

        <SectionCard
          icon={<Rows3 className="h-4 w-4" />}
          title="Rows"
          count={rows.length}
          emptyText="No rows yet. Add your first provider below."
          addPlaceholder="e.g. AWS, Google Cloud, Azure…"
          onAdd={addRow}
        >
          {rows.map((row, idx) => (
            <ListItem
              key={row.id}
              label={row.name}
              isFirst={idx === 0}
              isLast={idx === rows.length - 1}
              onMoveUp={() => moveRow(row.id, "up")}
              onMoveDown={() => moveRow(row.id, "down")}
              onRename={(name) => renameRow(row.id, name)}
              onDelete={() => setDeleteTarget({ type: "row", item: row })}
            />
          ))}
        </SectionCard>
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>"{deleteTarget?.item.name}"</strong> and all associated
              scores and notes. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-lg bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FAB */}
      <Link to="/table" className="fixed bottom-7 right-7 z-50 cursor-pointer">
        <div className="flex items-center gap-2 px-5 h-12 rounded-full bg-zinc-900 text-white text-sm font-medium shadow-xl hover:bg-zinc-700 transition-colors">
          <TableIcon className="h-4 w-4" />
          View Table
        </div>
      </Link>
    </div>
  );
}
