export interface ReductionDataPoint {
  month: string;
  value: number;
}

export interface ReductionTrendResponse {
  data: ReductionDataPoint[];
}
