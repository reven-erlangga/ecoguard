import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class GetUserMentionsService {
  async getUserMentions(params: {
    userName?: string;
    sinceTime?: number;
    untilTime?: number;
    cursor?: string;
  }) {
    const apiKey = process.env.TWITTERAPI_KEY;
    const defaultUname = process.env.TWITTERAPI_UNAME;

    const userName = params.userName || defaultUname;

    if (!userName) {
      throw new HttpException(
        'UserName is required. Please provide it or set TWITTERAPI_UNAME in env.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!apiKey) {
      throw new HttpException(
        'API Key is required. Please set TWITTERAPI_KEY in env.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const url = new URL('https://api.twitterapi.io/twitter/user/mentions');
    url.searchParams.append('userName', userName);
    
    if (params.sinceTime) {
      url.searchParams.append('sinceTime', params.sinceTime.toString());
    }
    if (params.untilTime) {
      url.searchParams.append('untilTime', params.untilTime.toString());
    }
    if (params.cursor) {
      url.searchParams.append('cursor', params.cursor);
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(
          errorData.message || 'Failed to fetch user mentions',
          response.status,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
