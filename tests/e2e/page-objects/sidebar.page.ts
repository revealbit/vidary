import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { TEXT_CONTENT, SELECTORS } from '../config/test-constants';

export class SidebarPage extends BasePage {
  readonly title: Locator;
  readonly addVideoButton: Locator;
  readonly addGroupButton: Locator;
  readonly hideButton: Locator;
  readonly showButton: Locator;
  readonly exportButton: Locator;
  readonly importButton: Locator;
  readonly resizeHandle: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByText(TEXT_CONTENT.APP_TITLE);
    this.addVideoButton = page.getByRole('button', { name: /Video/ });
    this.addGroupButton = page.getByRole('button', { name: /Group/ });
    this.hideButton = page.locator('button').filter({ has: page.locator('svg.lucide-panel-left-close') });
    this.showButton = page.locator('button').filter({ has: page.locator('svg.lucide-panel-left-open') });
    this.exportButton = page.getByRole('button', { name: /Export/ });
    this.importButton = page.getByRole('button', { name: /Import/ });
    this.resizeHandle = page.locator(SELECTORS.RESIZE_HANDLE).first();
  }

  async hide() {
    await this.hideButton.click();
  }

  async show() {
    await this.showButton.click();
  }

  async resize(x: number) {
    const box = await this.resizeHandle.boundingBox();

    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.move(x, box.y + box.height / 2);
      await this.page.mouse.up();
    }
  }

  async exportData() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportButton.click();
    return await downloadPromise;
  }

  async importData(jsonData: string) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.importButton.click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(jsonData)
    });
  }
}
