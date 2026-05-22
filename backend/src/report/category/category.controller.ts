import { Controller, Get } from '@nestjs/common';
import { IssueService } from '../../issue/issue.service';

@Controller('report/category')
export class CategoryController {
  constructor(private readonly issueService: IssueService) {}

  @Get()
  async getCategories() {
    const issues = await this.issueService.findAll();
    const categories = await this.issueService.getCategories();
    const totalIssues = issues.length;

    // Count issues per category
    const categoryCounts = issues.reduce((acc, issue) => {
      const catId = issue.category_id || 'UNKNOWN';
      acc[catId] = (acc[catId] || 0) + 1;
      return acc;
    }, {});

    return categories.map(cat => {
      const count = categoryCounts[cat.id] || 0;
      const percentageNum = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0;
      return {
        id: cat.id,
        name: `${cat.name} (${cat.english_name || ''})`,
        count,
        percentage: `${percentageNum}%`,
      };
    });
  }
}
