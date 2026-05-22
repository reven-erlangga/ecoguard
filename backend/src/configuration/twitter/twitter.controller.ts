import { Controller, Get, Post, Body } from '@nestjs/common';
import { TwitterConfigService } from './twitter-config.service';

@Controller('twitter/status')
export class TwitterController {
  constructor(private readonly twitterConfigService: TwitterConfigService) {}

  /**
   * Get current stream status
   * URL: GET /twitter/status
   */
  @Get()
  getStatus() {
    const isEnabled = this.twitterConfigService.isStreamEnabled();
    return {
      enabled: isEnabled,
      status: isEnabled ? 'ACTIVE' : 'DEACTIVE',
    };
  }

  /**
   * Set stream status
   * URL: POST /twitter/status
   * Body: { "enabled": true } or { "enabled": false }
   */
  @Post()
  async setStatus(@Body('enabled') enabled: boolean) {
    if (enabled) {
      await this.twitterConfigService.enableStream();
    } else {
      await this.twitterConfigService.disableStream();
    }
    
    console.log(`[TwitterController] User requested to change stream status to: ${enabled ? 'ACTIVE' : 'INACTIVE'}`);

    const isEnabled = this.twitterConfigService.isStreamEnabled();
    return {
      success: true,
      enabled: isEnabled,
      status: isEnabled ? 'ACTIVE' : 'DEACTIVE',
    };
  }
}
