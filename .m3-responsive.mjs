import { chromium } from "playwright";

const sizes = [
  { name: "large-desktop", width: 1920, height: 1080 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "short-landscape", width: 812, height: 375 },
];

const results = {};
const browser = await chromium.launch();
for (const size of sizes) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.screenshot({ path: `m3-${size.name}-hero.png` });
  await page.evaluate(() => document.querySelector("section:nth-of-type(2)")?.scrollIntoView());
  await page.waitForTimeout(150);
  await page.screenshot({ path: `m3-${size.name}-journey.png` });
  results[size.name] = {
    overflow: await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    canvasCount: await page.evaluate(() => document.querySelectorAll("canvas").length),
  };
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
