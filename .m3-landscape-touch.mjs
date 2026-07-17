import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 812, height: 375 },
  hasTouch: true,
  isMobile: true,
});
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const canvasCount = await page.evaluate(() => document.querySelectorAll("canvas").length);
const milestoneListVisible = await page.evaluate(() => {
  const ol = document.querySelector("ol[aria-label]");
  const wrapper = ol?.parentElement;
  return wrapper ? getComputedStyle(wrapper).position !== "absolute" : null;
});
console.log(JSON.stringify({ canvasCount, milestoneListVisible }, null, 2));
await browser.close();
