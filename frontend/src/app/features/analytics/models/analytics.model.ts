export interface DistributionData {
  category: string;
  value: number;
  color: string;
}

export type IIssueDistributionAPI = Array<{ category: string, count: number }>;

export interface IAnalyticsAPIResponse {
  issue_distribution: IIssueDistributionAPI;
}
