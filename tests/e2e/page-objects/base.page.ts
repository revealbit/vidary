import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async reload() {
    await this.page.reload();
  }
}
