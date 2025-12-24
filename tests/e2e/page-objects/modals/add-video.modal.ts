import { Page, Locator } from '@playwright/test';
import { TIMEOUTS, TEXT_CONTENT } from '../../config/test-constants';

export class AddVideoModal {
  readonly page: Page;
  readonly urlInput: Locator;
  readonly titleInput: Locator;
  readonly groupSelect: Locator;
  readonly statusSelect: Locator;
  readonly descriptionInput: Locator;
  readonly addButton: Locator;
  readonly cancelButton: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.urlInput = page.getByPlaceholder('https://www.youtube.com/watch?v=...');
    this.titleInput = page.getByPlaceholder('Video name');
    this.groupSelect = page.getByRole('combobox').first();
    this.statusSelect = page.locator('select').nth(1);
    this.descriptionInput = page.getByPlaceholder('Additional information about the video...');
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.heading = page.getByText(TEXT_CONTENT.ADD_VIDEO_TITLE);
  }

  async open() {
    await this.page.getByRole('button', { name: /Video/ }).click();
  }

  async addVideo(url: string, title?: string, options?: {
    group?: string;
    status?: string;
    description?: string;
  }) {
    await this.urlInput.fill(url);

    if (title) {
      await this.titleInput.fill(title);
    } else {
      await this.page.waitForTimeout(TIMEOUTS.TITLE_FETCH);
      const titleValue = await this.titleInput.inputValue();
      if (!titleValue) {
        await this.titleInput.fill('Test Video');
      }
    }

    if (options?.group) {
      await this.groupSelect.selectOption({ label: options.group });
    }

    if (options?.status) {
      await this.statusSelect.selectOption(options.status);
    }

    if (options?.description) {
      await this.descriptionInput.fill(options.description);
    }

    await this.addButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async getAllGroupOptions(): Promise<string[]> {
    return await this.page.locator('select option').allTextContents();
  }
}
