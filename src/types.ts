export interface AgendaItem {
  order: number;
  topic: string;
  durationMinutes: number;
  speakers?: string[];
}

export interface AgendaResponse {
  title: string;
  summary: string;
  stakeholders: string[];
  agendaItems: AgendaItem[];
}
