import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class VideoPlayerPage extends BasePage {
  readonly iframe: Locator;
  readonly emptyStateMessage: Locator;
  readonly videoTitle: Locator;
  readonly videoDescription: Locator;

  constructor(page: Page) {
    super(page);
    this.iframe = page.locator('iframe');
    this.emptyStateMessage = page.getByText('Select a video from the list');
    this.videoTitle = page.locator('h2, h3').first();
    this.videoDescription = page.locator('p').filter({ hasText: /.+/ });
  }

  async getVideoId(): Promise<string | null> {
    const src = await this.iframe.getAttribute('src');
    if (!src) return null;

    const match = src.match(/embed\/([^?]+)/);
    return match ? match[1] : null;
  }

  async getIframeDimensions() {
    return await this.iframe.boundingBox();
  }
}
