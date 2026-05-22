export type SystemState = 'ACTIVE' | 'INACTIVE';

export interface SystemStatusModel {
  state: SystemState;
  lastScan?: Date;
}
