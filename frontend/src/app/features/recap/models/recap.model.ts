export interface IRecapResponse {
  total_pending?: number;
  resolved_today?: number;
  unresolved_today?: number;
  total_category?: number;
}

export interface RecapData {
  totalPending?: number;
  resolvedToday?: number;
  unresolvedToday?: number;
  totalCategory?: number;
}
