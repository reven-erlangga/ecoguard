export type IssueStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'UNRESOLVED' | 'CLOSED' | 'NEED_INFO';

export interface IIssueResponse {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: Date;
  updatedAt: Date;
}

export interface IssuePagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}
