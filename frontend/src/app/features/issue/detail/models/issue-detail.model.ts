export type IssueStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'UNRESOLVED' | 'NEED_INFO';

export interface LocationPoint {
  name: string;
  lat: number;
  lon: number;
}

export interface LatestResolution {
  status: IssueStatus;
  note?: string | null;
  image_url?: string | null;
}

export interface BlockchainMetadata {
  success: boolean;
  transaction_id: string;
  timestamp: string;
  id: string;
  hash: string;
  message: string;
}

export interface AnalysisMetadata {
  blockchain?: BlockchainMetadata;
  clusters?: any[] | null;
}

export interface CategoryInfo {
  id: string;
  name: string;
  english_name: string;
}

export interface IIssueResponse {
  id: string;
  source_tweet_id?: string;
  title: string;
  description: string;
  content?: string;
  status: IssueStatus;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location?: LocationPoint[] | null;
  category_id?: string;
  metadata?: AnalysisMetadata;
  created_at: string;
  updated_at: string;
  category?: CategoryInfo;
  latest_resolution?: LatestResolution | null;
}

export interface Issue {
  id: string;
  source_tweet_id?: string;
  title: string;
  description: string;
  content?: string;
  status: IssueStatus;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location?: LocationPoint[] | null;
  category_id?: string;
  metadata?: AnalysisMetadata;
  createdAt: Date;
  updatedAt: Date;
  category?: CategoryInfo;
  latestResolution?: LatestResolution | null;
}
