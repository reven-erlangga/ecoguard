import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StageComponent } from '../../features/issue/stage/main.component';
import { IssueDatatableComponent } from '../../features/issue/datatable/main.component';
import { SocialReportComponent } from '../../features/issue/social-report/main.component';

import { MainTemplateComponent } from '../../shared/templates/main-template/main-template.component';

@Component({
  selector: 'app-issue',
  imports: [
    CommonModule, 
    StageComponent,
    IssueDatatableComponent,
    SocialReportComponent,
    MainTemplateComponent
  ],
  templateUrl: './issue.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueComponent {
  private router = inject(Router);
  stats = signal([
    { label: 'Total Carbon Offset', value: '2,450.8 tons', change: '+12.5%', isPositive: true },
    { label: 'Verified Reports', value: '158', change: '+5.2%', isPositive: true },
    { label: 'Active Projects', value: '24', change: '0%', isPositive: true },
    { label: 'Blockchain Nodes', value: '1,024', change: '+2.1%', isPositive: true },
  ]);

  activities = signal([
    { id: 'TRK-001', project: 'Reforestation A1', status: 'Verified', date: '2024-05-01', impact: '12.5 tons', color: 'emerald' },
    { id: 'TRK-002', project: 'Solar Farm B2', status: 'Pending', date: '2024-04-30', impact: '8.2 tons', color: 'amber' },
    { id: 'TRK-003', project: 'Water Cleanup C1', status: 'Verified', date: '2024-04-29', impact: '5.0 tons', color: 'emerald' },
    { id: 'TRK-004', project: 'Waste Management D1', status: 'Rejected', date: '2024-04-28', impact: '0 tons', color: 'rose' },
  ]);

  timeline = signal([
    { 
      title: 'Batch Verification Complete', 
      time: '1 hour ago', 
      desc: 'Data points for Reforestation A1 verified by 5 independent blockchain nodes.',
      hash: '0x7f8e9a2b3c4d5e6f7a8b9c0d1e2f3a4b',
      status: 'success',
      type: 'Verification'
    },
    { 
      title: 'New IoT Entry Recorded', 
      time: '3 hours ago', 
      desc: 'Sensor #422 logged 45.2kg of waste processed at Plant D1.',
      hash: '0x2a3d4f5e6b7c8d9e0f1a2b3c4d5e6f7a',
      status: 'processing',
      type: 'Ingestion'
    },
    { 
      title: 'Smart Contract Executed', 
      time: '5 hours ago', 
      desc: 'Automatic credit distribution triggered for verified impact at Project C1.',
      hash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e',
      status: 'success',
      type: 'Contract'
    }
  ]);

  tweets = signal([
    { user: 'Erlangga', handle: '@erlngga', content: 'bekasi banjir terus di daerah unisma', time: '2m ago', avatar: 'https://ui-avatars.com/api/?name=Erlangga&background=random' },
    { user: 'Siti Aminah', handle: '@sitiaminah', content: 'Hujan deras di Bogor, waspada banjir kiriman ke Jakarta sore ini.', time: '15m ago', avatar: 'https://ui-avatars.com/api/?name=Siti+Aminah&background=random' },
    { user: 'Info Jakarta', handle: '@infojkt', content: 'Kualitas udara Jakarta pagi ini berada di kategori tidak sehat. Mari gunakan masker saat beraktivitas di luar.', time: '1h ago', avatar: 'https://ui-avatars.com/api/?name=Info+Jakarta&background=random' },
  ]);

  selectLog(log: any) {
    this.router.navigate(['/issue', log.id]);
  }

  chartData = signal([
    { month: 'Jan', value: 45 },
    { month: 'Feb', value: 52 },
    { month: 'Mar', value: 48 },
    { month: 'Apr', value: 70 },
    { month: 'May', value: 85 },
    { month: 'Jun', value: 65 },
  ]);
}
