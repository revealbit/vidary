import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { SELECTORS, TIMEOUTS } from '../config/test-constants';
import { dragElement, waitForStateUpdate } from '../helpers/test-helpers';

export class TreeViewPage extends BasePage {
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emptyMessage = page.getByText('No items. Add a group or video.');
  }

  getItemByName(name: string): Locator {
    return this.page.locator(`${SELECTORS.TRUNCATE_TEXT}`).filter({ hasText: new RegExp(`^${name}$`) });
  }

  getVideoRow(name: string): Locator {
    return this.page.locator('div').filter({ hasText: new RegExp(`^${name}$`) }).first();
  }

  async clickItem(name: string) {
    await this.getItemByName(name).click();
  }

  async hoverItem(name: string) {
    await this.getItemByName(name).hover();
  }

  async editItem(name: string) {
    const row = this.getVideoRow(name);
    await row.hover();
    await row.locator('button').filter({ has: this.page.locator('svg.lucide-pencil') }).click();
  }

  async deleteItem(name: string) {
    const row = this.getVideoRow(name);
    await row.hover();
    await row.locator('button').filter({ has: this.page.locator('svg.lucide-trash-2') }).click();
  }

  async toggleWatchedStatus(name: string) {
    const row = this.getVideoRow(name);
    await row.hover();
    const toggleButton = row.locator('button').filter({
      has: this.page.locator('svg.lucide-circle, svg.lucide-check-circle')
    }).first();
    await toggleButton.click();
  }

  async editGroupName(currentName: string, newName: string, confirm = true) {
    await this.getItemByName(currentName).hover();
    await this.page.locator('button').filter({ has: this.page.locator('svg.lucide-pencil') }).click();

    const input = this.page.locator('input[type="text"]').last();
    await input.fill(newName);

    if (confirm) {
      await this.page.keyboard.press('Enter');
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  async dragItemToTarget(sourceItemName: string, targetItemName: string) {
    const sourceRow = this.getVideoRow(sourceItemName);
    const sourceGrip = sourceRow.locator('button').first();
    const target = this.getItemByName(targetItemName);

    const gripBox = await sourceGrip.boundingBox();
    const targetBox = await target.boundingBox();

    if (gripBox && targetBox) {
      await dragElement(
        this.page,
        { x: gripBox.x + gripBox.width / 2, y: gripBox.y + gripBox.height / 2 },
        { x: targetBox.x + targetBox.width / 2, y: targetBox.y + targetBox.height / 2 }
      );
    }

    await waitForStateUpdate(this.page, TIMEOUTS.STATE_UPDATE);
  }

  async getFirstItemText(): Promise<string> {
    return await this.page.locator(SELECTORS.TRUNCATE_TEXT).first().textContent() || '';
  }

  async getStatusIcon(videoName: string): Locator {
    const row = this.getVideoRow(videoName);
    return row.locator('svg').first();
  }
}
