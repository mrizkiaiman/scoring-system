export interface Column {
  id: string;
  name: string;
}

export interface Row {
  id: string;
  name: string;
}

export interface ScoringData {
  columns: Column[];
  rows: Row[];
  rowLabel: string; // the sticky first column header name
  avgLabel: string; // the sticky last column header name
  scores: Record<string, Record<string, number>>; // scores[rowId][colId]
  notes: Record<string, Record<string, string>>; // notes[rowId][colId]
}

export const DEFAULT_DATA: ScoringData = {
  rowLabel: "Provider",
  avgLabel: "Avg",
  columns: [
    { id: "col-1", name: "Cost" },
    { id: "col-2", name: "Output AI" },
    { id: "col-3", name: "Ecosystem Fit" },
    { id: "col-4", name: "Keamanan" },
    { id: "col-5", name: "Stabilitas" },
    { id: "col-6", name: "Use Case Fit & Benefit" },
  ],
  rows: [
    { id: "row-1", name: "AWS -> Kiro" },
    { id: "row-2", name: "Google -> Gemini" },
    { id: "row-3", name: "Github -> Copilot" },
    { id: "row-4", name: "Anthropic -> Claude" },
    { id: "row-5", name: "OpenAI -> Codex" },
    { id: "row-6", name: "Windsurf" },
  ],
  scores: {},
  notes: {},
};
