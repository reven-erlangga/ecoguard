import { Controller, Get, Param, Patch, Body, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IssueService } from './issue.service';
import { GetIssuesQueryDto } from './dto/get-issues-query.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

@Controller('issue')
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Get()
  async findAll(@Query() query?: GetIssuesQueryDto) {
    return this.issueService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.issueService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateIssueDto,
    @UploadedFile() file?: any,
  ) {
    console.log('[BACKEND DEBUG] PATCH /issue/:id called with:', { id, updateData, file });
    return this.issueService.update(id, updateData, file);
  }
}
