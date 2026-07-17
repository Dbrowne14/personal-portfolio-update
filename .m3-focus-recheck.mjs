import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000");
// Fresh load, deliberately click somewhere neutral first so focus isn't
// already on the masthead link before we test Tab.
await page.mouse.click(700, 10);
await page.keyboard.press("Tab");
await page.waitForTimeout(400);
const onFocus = await page.evaluate(() => ({
  activeText: document.activeElement?.textContent?.trim(),
  opacity: getComputedStyle(document.querySelector(".masthead-name")).opacity,
}));
await page.keyboard.press("Tab");
await page.waitForTimeout(400);
const afterMovingOn = await page.evaluate(
  () => getComputedStyle(document.querySelector(".masthead-name")).opacity,
);

// Also re-check afterNavBack with a longer settle time.
await page.getByRole("link", { name: "About" }).click();
await page.waitForURL("**/about");
await page.getByRole("link", { name: "David Browne" }).click();
await page.waitForURL("http://localhost:3000/");
await page.waitForTimeout(400);
const afterNavBackSettled = await page.evaluate(() => ({
  dataPage: document.documentElement.dataset.page ?? null,
  mastheadOpacity: getComputedStyle(document.querySelector(".masthead-name")).opacity,
}));

console.log(JSON.stringify({ onFocus, afterMovingOn, afterNavBackSettled }, null, 2));
await browser.close();
