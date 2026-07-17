import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000");
await page.evaluate(() => document.querySelector("section:nth-of-type(2)")?.scrollIntoView());
await page.waitForTimeout(200);
const stage = page.locator("section:nth-of-type(2) .absolute.inset-0").last();
const box = await stage.boundingBox();
await page.mouse.move(box.x + box.width * 0.02, box.y + box.height * 0.5);
await page.waitForTimeout(150);
await page.screenshot({ path: "m3-desktop-scrub-early.png" });
const tooltipLeft = await page.evaluate(() => {
  const el = document.querySelector(".border-plate-accent");
  const rect = el.getBoundingClientRect();
  return { left: rect.left, right: rect.right, text: el.textContent };
});
await page.mouse.move(box.x + box.width * 0.98, box.y + box.height * 0.5);
await page.waitForTimeout(150);
await page.screenshot({ path: "m3-desktop-scrub-right-edge.png" });
const tooltipRight = await page.evaluate(() => {
  const el = document.querySelector(".border-plate-accent");
  const rect = el.getBoundingClientRect();
  return { left: rect.left, right: rect.right, text: el.textContent, viewportWidth: window.innerWidth };
});
console.log(JSON.stringify({ tooltipLeft, tooltipRight }, null, 2));
await browser.close();
