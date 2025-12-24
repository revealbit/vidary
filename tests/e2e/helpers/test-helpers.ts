import { Page } from '@playwright/test';

export async function acceptDialogs(page: Page) {
  page.on('dialog', dialog => dialog.accept());
}

export async function waitForStateUpdate(page: Page, timeout = 100) {
  await page.waitForTimeout(timeout);
}

export async function dragElement(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
  steps = 10
) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps });
  await page.mouse.up();
}
