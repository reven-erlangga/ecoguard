import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TwitterConfigService } from '../../../configuration/twitter/twitter-config.service';
import { Subscription } from 'rxjs';
import { AnalyzerService } from '../../../analyzer/analyzer.service';

@Injectable()
export class MentionsStreamService implements OnModuleInit, OnModuleDestroy {
  private readonly baseUrl = 'https://api.x.com/2';
  private readonly bearerToken = process.env.X_BEARER_TOKEN;
  private streamSubscription: Subscription;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isConnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private abortController: AbortController | null = null;
  private stopRequested = false;
  private consecutiveFailures = 0;

  constructor(
    private readonly twitterConfigService: TwitterConfigService,
    private readonly analyzerService: AnalyzerService,
  ) {}

  onModuleInit() {
    // Listen for stream configuration changes
    this.streamSubscription = this.twitterConfigService.streamStatus$.subscribe(
      (isEnabled) => {
        if (isEnabled) {
          console.log('MentionsStreamService: Activation requested');
          this.startStream();
        } else {
          console.log('MentionsStreamService: Deactivation requested');
          this.stopStream();
        }
      },
    );
  }

  onModuleDestroy() {
    // Clean up subscription and connection on module destroy
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
    this.stopStream();
  }

  private clearReconnectTimer() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private scheduleReconnect(delayMs: number) {
    this.clearReconnectTimer();
    if (!this.twitterConfigService.isStreamEnabled()) return;
    this.reconnectTimeout = setTimeout(() => {
      this.startStream();
    }, delayMs);
  }

  private computeBackoffMs(baseMs: number, maxMs: number) {
    const exp = Math.min(this.consecutiveFailures, 6);
    const scaled = Math.min(maxMs, baseMs * Math.pow(2, exp));
    const jitter = Math.floor(
      Math.random() * Math.min(1000, Math.floor(scaled * 0.1)),
    );
    return scaled + jitter;
  }

  private extractTweetData(payload: unknown) {
    if (!payload || typeof payload !== 'object') return null;
    const obj = payload as Record<string, unknown>;

    const data = obj.data;
    if (!data || typeof data !== 'object') return null;
    const dataObj = data as Record<string, unknown>;

    const tweetText = dataObj.text;
    const tweetId = dataObj.id;

    if (typeof tweetText !== 'string' || typeof tweetId !== 'string') {
      return null;
    }

    const matchingRulesRaw = obj.matching_rules;
    const matchingRuleTags: string[] = Array.isArray(matchingRulesRaw)
      ? matchingRulesRaw
          .filter(
            (r): r is Record<string, unknown> => !!r && typeof r === 'object',
          )
          .map((r) => (typeof r.tag === 'string' ? r.tag : undefined))
          .filter(
            (tag): tag is string => typeof tag === 'string' && tag.length > 0,
          )
      : [];

    return { tweetText, tweetId, matchingRuleTags };
  }

  async stopStream() {
    this.stopRequested = true;
    this.clearReconnectTimer();

    if (this.abortController) {
      try {
        this.abortController.abort();
      } catch {
        // Ignore
      }
      this.abortController = null;
    }

    if (this.reader) {
      console.log('Closing X Stream connection...');
      try {
        await this.reader.cancel();
      } catch {
        // Ignore error on cancel
      }
      this.reader = null;
    }
  }

  async startStream() {
    // Prevent multiple concurrent connection attempts
    if (this.isConnecting) return;
    this.isConnecting = true;
    this.stopRequested = false;
    this.clearReconnectTimer();

    if (!this.bearerToken) {
      console.error('X_BEARER_TOKEN is not set in environment variables');
      this.isConnecting = false;
      return;
    }

    const url = `${this.baseUrl}/tweets/search/stream`;

    console.log('Connecting to X Filtered Stream...');

    try {
      this.abortController = new AbortController();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.bearerToken}`,
        },
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`X Stream Error: ${response.status} - ${errorText}`);

        this.consecutiveFailures += 1;
        const isRateLimited = response.status === 429;
        const isTooManyConnections =
          isRateLimited && /TooManyConnections/i.test(errorText);
        const baseDelayMs = isTooManyConnections
          ? 120000
          : isRateLimited
            ? 60000
            : 10000;
        const retryTime = this.computeBackoffMs(baseDelayMs, 10 * 60_000);

        if (isRateLimited) {
          console.log(
            `Rate limit exceeded. Backing off for ${Math.ceil(retryTime / 1000)} seconds...`,
          );
        } else {
          console.log(`Retrying in ${Math.ceil(retryTime / 1000)} seconds...`);
        }

        if (this.twitterConfigService.isStreamEnabled()) {
          this.scheduleReconnect(retryTime);
        }
        return;
      }

      if (!response.body) {
        console.error('Stream body is null');
        this.consecutiveFailures += 1;
        const retryTime = this.computeBackoffMs(10000, 10 * 60_000);
        console.log(`Retrying in ${Math.ceil(retryTime / 1000)} seconds...`);
        if (this.twitterConfigService.isStreamEnabled()) {
          this.scheduleReconnect(retryTime);
        }
        return;
      }

      this.consecutiveFailures = 0;
      const reader = response.body.getReader();
      this.reader = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      console.log('Connected to X Stream. Listening for mentions...');

      while (true) {
        // Check if stream was disabled while reading
        if (!this.twitterConfigService.isStreamEnabled()) {
          console.log('Stream disabled by config. Stopping reader...');
          break;
        }

        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream connection closed by server.');
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // X API separates data with CRLF (\r\n)
        const lines = buffer.split('\r\n');

        // Save the last incomplete line to buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (trimmedLine) {
            try {
              const data: unknown = JSON.parse(trimmedLine);
              console.log('[MentionsStreamService] New Mention Detected!');
              console.dir(data, { depth: null });

              const extracted = this.extractTweetData(data);
              if (extracted) {
                const { tweetText, tweetId, matchingRuleTags } = extracted;

                const isReport =
                  matchingRuleTags.includes('report') ||
                  /#LAPORINAJA/i.test(tweetText);

                if (isReport) {
                  // 1. Analyze the tweet and persist it directly as an Issue in Firebase
                  const result = await this.analyzerService.evaluate(
                    tweetText,
                    tweetId,
                  );
                  if (result.success && result.savedIssue) {
                    console.log(
                      `[MentionsStreamService] Issue created in Firebase for tweet ${tweetId} (Analyzed, Translated & Verified)`,
                    );
                  }
                } else {
                  console.log(
                    `[MentionsStreamService] Ignored general mention tweet ${tweetId} (not tagged as 'report')`,
                  );
                }
              }
            } catch {
              // Ignore if not valid JSON (e.g. heartbeat empty lines from X)
            }
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (this.stopRequested || this.abortController?.signal.aborted) {
        console.log('Stream stopped. Will not reconnect.');
      } else {
        console.error('Error in X Stream:', message);
        this.consecutiveFailures += 1;
        const retryTime = this.computeBackoffMs(5000, 10 * 60_000);
        console.log(
          `Reconnecting to stream in ${Math.ceil(retryTime / 1000)} seconds...`,
        );
        if (this.twitterConfigService.isStreamEnabled()) {
          this.scheduleReconnect(retryTime);
        }
      }
    } finally {
      this.isConnecting = false;
      this.reader = null;
      this.abortController = null;

      if (!this.twitterConfigService.isStreamEnabled()) {
        this.clearReconnectTimer();
      }
    }
  }
}
