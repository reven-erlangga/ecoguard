import { Controller, Get } from '@nestjs/common';

@Controller('report/issue')
export class IssueController {
  @Get()
  getIssues() {
    // Dummy data for active issues (not done)
    return [
      {
        id: 'ISS-001',
        title: 'Lubang besar di Jl. Sudirman',
        category: 'Jalan Rusak',
        status: 'In Progress',
        reporter: '@warga_jakarta',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ISS-002',
        title: 'Lampu jalan mati di perempatan Kuningan',
        category: 'Lampu Jalan Mati',
        status: 'In Progress',
        reporter: '@budi_driver',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ISS-003',
        title: 'Genangan air semata kaki di Kelapa Gading',
        category: 'Banjir/Genangan',
        status: 'Pending',
        reporter: '@ani_kuliner',
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
