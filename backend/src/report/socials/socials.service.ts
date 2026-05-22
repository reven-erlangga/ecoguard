import { Injectable } from '@nestjs/common';
import { IssueService } from '../../issue/issue.service';
import { GetSocialsQueryDto } from './dto/get-socials-query.dto';

@Injectable()
export class SocialsService {
  constructor(private readonly issueService: IssueService) {}

  async getSocialFeed(query?: GetSocialsQueryDto) {
    // Fetch issues matching base filters (excluding pagination) to filter tweets correctly
    const issues = await this.issueService.findAll({
      search: query?.search,
      categoryId: query?.categoryId,
      status: query?.status,
    });
    
    // Filter issues that strictly have a valid source_tweet_id (not empty)
    const socialIssues = issues.filter(issue => 
      issue.source_tweet_id && 
      typeof issue.source_tweet_id === 'string' && 
      issue.source_tweet_id.trim() !== ''
    );

    const results = socialIssues.map(issue => {
      return {
        id: issue.id,
        tweet_id: issue.source_tweet_id,
      };
    });

    // Apply pagination if parameters are supplied
    if (query?.page !== undefined || query?.limit !== undefined) {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const total = results.length;
      const totalPages = Math.ceil(total / limit) || 1;

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const slicedResults = results.slice(startIndex, endIndex);

      return {
        data: slicedResults,
        total,
        totalPages,
        page,
        limit
      };
    }

    return results;
  }
}
