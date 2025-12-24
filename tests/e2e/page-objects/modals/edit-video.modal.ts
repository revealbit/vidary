import { Page, Locator } from '@playwright/test';
import { TEXT_CONTENT, TIMEOUTS } from '../../config/test-constants';

export class EditVideoModal {
  readonly page: Page;
  readonly urlInput: Locator;
  readonly titleInput: Locator;
  readonly groupSelect: Locator;
  readonly statusSelect: Locator;
  readonly descriptionInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly refreshButton: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.urlInput = page.getByPlaceholder('https://www.youtube.com/watch?v=...');
    this.titleInput = page.getByPlaceholder('Video name');
    this.groupSelect = page.getByRole('combobox').first();
    this.statusSelect = page.locator('select').nth(1);
    this.descriptionInput = page.getByPlaceholder('Additional information about the video...');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.refreshButton = page.locator('button').filter({ has: page.locator('svg.lucide-refresh-cw') });
    this.heading = page.getByRole('heading', { name: TEXT_CONTENT.EDIT_VIDEO_TITLE });
  }

  async updateTitle(title: string) {
    await this.titleInput.fill(title);
    await this.saveButton.click();
  }

  async updateUrl(url: string) {
    await this.urlInput.fill(url);
    await this.saveButton.click();
  }

  async updateGroup(groupName: string) {
    await this.groupSelect.selectOption({ label: groupName });
    await this.saveButton.click();
  }

  async updateStatus(status: string) {
    await this.statusSelect.selectOption(status);
    await this.saveButton.click();
  }

  async updateDescription(description: string) {
    await this.descriptionInput.fill(description);
    await this.saveButton.click();
  }

  async refreshTitleFromYouTube() {
    await this.refreshButton.click();
    await this.page.waitForTimeout(TIMEOUTS.TITLE_FETCH);
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async getAllGroupOptions(): Promise<string[]> {
    return await this.page.locator('select option').allTextContents();
  }
}
