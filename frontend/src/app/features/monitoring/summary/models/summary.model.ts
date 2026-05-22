export interface AuditingStats {
  totalReports: number;
  activeNodes: number;
  investigating: number;
  neutralized: number;
}

export interface IMonitoringStatusResponse {
  total_reports: number;
  active_nodes: number;
  investigating: number;
  neutralized: number;
}
