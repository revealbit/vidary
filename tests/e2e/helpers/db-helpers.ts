import { Page } from '@playwright/test';

export class DbHelpers {
  constructor(private page: Page) {}

  async clearDatabase() {
    await this.page.evaluate(() => {
      localStorage.clear();
      indexedDB.deleteDatabase('VidaryDB');
    });
  }

  async getSidebarWidth(): Promise<number> {
    const width = await this.page.evaluate(() => localStorage.getItem('sidebarWidth'));
    return parseInt(width || '0');
  }
}
