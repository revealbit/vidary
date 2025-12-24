import { Page, Locator } from '@playwright/test';
import { TEXT_CONTENT } from '../../config/test-constants';

export class AddGroupModal {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly parentSelect: Locator;
  readonly addButton: Locator;
  readonly cancelButton: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByPlaceholder('e.g. Basic Trainings');
    this.parentSelect = page.getByRole('combobox');
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.heading = page.getByRole('heading', { name: TEXT_CONTENT.ADD_GROUP_TITLE });
  }

  async open() {
    await this.page.getByRole('button', { name: /Group/ }).click();
  }

  async addGroup(name: string, parent?: string) {
    await this.nameInput.fill(name);

    if (parent) {
      await this.parentSelect.selectOption({ label: parent });
    }

    await this.addButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async getAllParentOptions(): Promise<string[]> {
    return await this.page.locator('select option').allTextContents();
  }
}
