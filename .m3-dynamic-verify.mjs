import { chromium } from "playwright";

const results = {};
const browser = await chromium.launch();

// 1. Desktop dot-hover dynamism.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleMessages = [];
  page.on("console", (m) => consoleMessages.push({ type: m.type(), text: m.text() }));
  page.on("pageerror", (e) => consoleMessages.push({ type: "pageerror", text: String(e) }));
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => document.querySelector("section:nth-of-type(2)")?.scrollIntoView());
  await page.waitForTimeout(200);

  const stage = page.locator("section:nth-of-type(2) .absolute.inset-0").last();
  const box = await stage.boundingBox();

  // Screenshot far from any milestone (baseline, small dots).
  await page.mouse.move(box.x + box.width * 0.12, box.y + box.height * 0.5);
  await page.waitForTimeout(100);
  await page.screenshot({ path: "m3-hover-baseline.png", clip: { x: box.x, y: box.y + box.height * 0.6, width: 260, height: 200 } });

  // Screenshot right on top of the 2022 milestone (t=0.3).
  const targetX = box.x + box.width * 0.3;
  await page.mouse.move(targetX, box.y + box.height * 0.5);
  await page.waitForTimeout(100);
  await page.screenshot({ path: "m3-hover-on-2022.png", clip: { x: targetX - 130, y: box.y + box.height * 0.4, width: 260, height: 200 } });

  results.desktopConsole = consoleMessages;
  results.desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await page.close();
}

// 2. Mobile dynamic timeline.
{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const consoleMessages = [];
  page.on("console", (m) => consoleMessages.push({ type: m.type(), text: m.text() }));
  page.on("pageerror", (e) => consoleMessages.push({ type: "pageerror", text: String(e) }));
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => document.querySelector("section:nth-of-type(2)")?.scrollIntoView());
  await page.waitForTimeout(300);
  await page.screenshot({ path: "m3-mobile-dynamic-top.png" });

  const initialActive = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-timeline-item]")).map((el) => el.hasAttribute("data-active")),
  );
  const initialFillHeight = await page.evaluate(() => {
    const fill = document.querySelector("[data-timeline-fill]");
    return fill ? getComputedStyle(fill).height : null;
  });

  // Scroll further down within the section to move to a later milestone.
  await page.evaluate(() => window.scrollBy(0, 250));
  await page.waitForTimeout(400);
  await page.screenshot({ path: "m3-mobile-dynamic-scrolled.png" });
  const scrolledActive = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-timeline-item]")).map((el) => el.hasAttribute("data-active")),
  );
  const scrolledFillHeight = await page.evaluate(() => {
    const fill = document.querySelector("[data-timeline-fill]");
    return fill ? getComputedStyle(fill).height : null;
  });

  results.mobileConsole = consoleMessages;
  results.mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  results.mobileCanvasCount = await page.evaluate(() => document.querySelectorAll("canvas").length);
  results.initialActive = initialActive;
  results.initialFillHeight = initialFillHeight;
  results.scrolledActive = scrolledActive;
  results.scrolledFillHeight = scrolledFillHeight;

  // Accessible content still fully present.
  results.mobileMilestoneText = await page.evaluate(() =>
    Array.from(document.querySelectorAll("ol[aria-label] li")).map((li) => li.textContent?.trim()),
  );
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
