import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { MessageSquare, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

interface ScoreCellProps {
  score: number | undefined;
  note: string | undefined;
  onScoreChange: (score: number | null) => void;
  onNoteChange: (note: string) => void;
}

const SCORE_COLORS: Record<number, string> = {
  1: "bg-red-50 text-red-600 ring-1 ring-red-200",
  2: "bg-orange-50 text-orange-600 ring-1 ring-orange-200",
  3: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
  4: "bg-lime-50 text-lime-700 ring-1 ring-lime-200",
  5: "bg-green-50 text-green-700 ring-1 ring-green-200",
};

export function ScoreCell({
  score,
  note,
  onScoreChange,
  onNoteChange,
}: ScoreCellProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [draftNote, setDraftNote] = useState(note ?? "");

  // Keep draft in sync when note changes externally and popover is closed
  useEffect(() => {
    if (!noteOpen) setDraftNote(note ?? "");
  }, [note, noteOpen]);

  const hasNote = !!note?.trim();

  function handleNoteSave() {
    onNoteChange(draftNote);
    setNoteOpen(false);
    toast.success(draftNote.trim() ? "Note saved" : "Note cleared");
  }

  return (
    <div className="flex items-center justify-center gap-1.5 w-full">
      {/* Score dropdown */}
      <Select
        value={score?.toString() ?? ""}
        onValueChange={(val) => onScoreChange(val ? parseInt(val, 10) : null)}
      >
        <SelectTrigger
          className={`h-8 flex-1 min-w-0 border-0 shadow-none font-semibold text-sm cursor-pointer focus:ring-0 rounded-lg transition-colors ${
            score
              ? SCORE_COLORS[score]
              : "text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50"
          }`}
        >
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent className="rounded-xl shadow-lg border-zinc-100">
          <SelectItem
            value="1"
            className="font-medium text-red-600 cursor-pointer"
          >
            1 — Poor
          </SelectItem>
          <SelectItem
            value="2"
            className="font-medium text-orange-600 cursor-pointer"
          >
            2 — Below Average
          </SelectItem>
          <SelectItem
            value="3"
            className="font-medium text-yellow-700 cursor-pointer"
          >
            3 — Average
          </SelectItem>
          <SelectItem
            value="4"
            className="font-medium text-lime-700 cursor-pointer"
          >
            4 — Good
          </SelectItem>
          <SelectItem
            value="5"
            className="font-medium text-green-700 cursor-pointer"
          >
            5 — Excellent
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Note icon — opens popover that shows note + edit form */}
      <Popover open={noteOpen} onOpenChange={setNoteOpen}>
        <PopoverTrigger
          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors cursor-pointer ${
            hasNote
              ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
              : "text-zinc-200 hover:text-zinc-400 hover:bg-zinc-100"
          }`}
        >
          {hasNote ? (
            <MessageSquare className="h-3.5 w-3.5 fill-current" />
          ) : (
            <MessageSquarePlus className="h-3.5 w-3.5" />
          )}
        </PopoverTrigger>

        <PopoverContent
          className="w-80 p-4 rounded-xl shadow-xl border-zinc-100"
          side="top"
        >
          {/* Show existing note read-only at the top if it exists */}
          {hasNote && (
            <div className="mb-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                Current note
              </p>
              <p className="text-sm text-emerald-900 leading-relaxed">{note}</p>
            </div>
          )}

          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            {hasNote ? "Edit note" : "Add note"}
          </p>
          <Textarea
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            placeholder="Why this score?"
            className="text-sm resize-none border-zinc-200 rounded-lg focus-visible:ring-1"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setNoteOpen(false)}
              className="px-3 h-8 rounded-lg text-sm text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleNoteSave}
              className="px-3 h-8 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
