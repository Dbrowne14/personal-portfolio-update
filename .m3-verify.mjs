import { chromium } from "playwright";

const results = {};
const MARKER = "scrubT"; // unique to journey-canvas.tsx's compiled output

async function collectScripts(page) {
  const bodies = [];
  page.on("response", async (res) => {
    const url = res.url();
    if (/\.js$/.test(url)) {
      try {
        bodies.push(await res.text());
      } catch {
        // navigation/abort races are fine to ignore here
      }
    }
  });
  return bodies;
}

// 1. Desktop: visual + full real Hero-to-masthead range (no injected spacer
//    — Journey now provides real scroll runway) + bundle check.
{
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleMessages = [];
  page.on("console", (m) => consoleMessages.push({ type: m.type(), text: m.text() }));
  page.on("pageerror", (e) => consoleMessages.push({ type: "pageerror", text: String(e) }));
  const scripts = await collectScripts(page);

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.screenshot({ path: "m3-desktop-hero.png" });

  const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportHeight = 900;
  results.realScrollableHeight = docHeight - viewportHeight;

  const samples = [];
  for (const frac of [0, 0.3, 0.5, 0.6, 0.72, 0.85, 1.0]) {
    await page.evaluate((f) => window.scrollTo(0, window.innerHeight * f), frac);
    await page.waitForTimeout(120);
    const s = await page.evaluate(() => ({
      compressed: document.documentElement.hasAttribute("data-hero-compressed"),
      mastheadOpacity: getComputedStyle(document.querySelector(".masthead-name")).opacity,
    }));
    samples.push({ frac, ...s });
  }
  results.realHeroCompressSamples = samples;

  // Scroll to the Journey section and screenshot it.
  await page.evaluate(() => {
    document.querySelector("section:nth-of-type(2)")?.scrollIntoView();
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: "m3-desktop-journey.png" });

  // Scrub interaction.
  const stage = page.locator("section:nth-of-type(2) .absolute.inset-0").last();
  const box = await stage.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.15, box.y + box.height * 0.5);
    await page.waitForTimeout(150);
    await page.screenshot({ path: "m3-desktop-scrub-early.png" });
    const tooltipEarly = await page.evaluate(
      () => document.querySelector(".border-plate-accent")?.textContent,
    );
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.5);
    await page.waitForTimeout(150);
    await page.screenshot({ path: "m3-desktop-scrub-late.png" });
    const tooltipLate = await page.evaluate(
      () => document.querySelector(".border-plate-accent")?.textContent,
    );
    results.scrubTooltips = { tooltipEarly, tooltipLate };
  }

  results.desktopCanvasCount = await page.evaluate(
    () => document.querySelectorAll("canvas").length,
  );
  results.desktopHasMarkerInBundle = scripts.some((s) => s.includes(MARKER));
  results.desktopOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  results.desktopConsole = consoleMessages;

  // Client-side nav away and back, checking data-page updates correctly.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("link", { name: "About" }).click();
  await page.waitForURL("**/about");
  results.afterNavAway = await page.evaluate(() => ({
    dataPage: document.documentElement.dataset.page ?? null,
    compressed: document.documentElement.hasAttribute("data-hero-compressed"),
  }));
  await page.getByRole("link", { name: "David Browne" }).click();
  await page.waitForURL("http://localhost:3000/");
  await page.waitForTimeout(100);
  results.afterNavBack = await page.evaluate(() => ({
    dataPage: document.documentElement.dataset.page ?? null,
    mastheadOpacity: getComputedStyle(document.querySelector(".masthead-name")).opacity,
  }));

  // Keyboard + focus.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.keyboard.press("Tab");
  await page.waitForTimeout(350);
  results.mastheadFocusOpacity = await page.evaluate(
    () => getComputedStyle(document.querySelector(".masthead-name")).opacity,
  );

  await browser.close();
}

// 2. Mobile: visual + timeline + bundle check (should NOT contain marker).
{
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
  });
  const scripts = await collectScripts(page);
  const consoleMessages = [];
  page.on("console", (m) => consoleMessages.push({ type: m.type(), text: m.text() }));
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.screenshot({ path: "m3-mobile-hero.png" });

  await page.evaluate(() => {
    document.querySelector("section:nth-of-type(2)")?.scrollIntoView();
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: "m3-mobile-journey.png" });

  results.mobileCanvasCount = await page.evaluate(
    () => document.querySelectorAll("canvas").length,
  );
  results.mobileHasMarkerInBundle = scripts.some((s) => s.includes(MARKER));
  results.mobileOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  results.mobileConsole = consoleMessages;

  // Milestone text present in the accessibility tree on mobile (visible).
  results.mobileMilestoneText = await page.evaluate(() =>
    Array.from(document.querySelectorAll("ol[aria-label] li")).map((li) =>
      li.textContent?.trim(),
    ),
  );

  // Mobile menu still works (portal regression check).
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForSelector('[role="dialog"]');
  const dialogBox = await page.locator('[role="dialog"]').boundingBox();
  results.mobileMenuFillsViewport =
    dialogBox && dialogBox.width === 375 && dialogBox.height === 812;
  await page.keyboard.press("Escape");

  await browser.close();
}

// 3. Milestone text present (desktop, sr-only) — accessibility tree check.
{
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000");
  results.desktopMilestoneText = await page.evaluate(() =>
    Array.from(document.querySelectorAll("ol[aria-label] li")).map((li) =>
      li.textContent?.trim(),
    ),
  );
  results.desktopMilestoneListClipped = await page.evaluate(() => {
    const ol = document.querySelector("ol[aria-label]");
    const wrapper = ol?.parentElement;
    return wrapper ? getComputedStyle(wrapper).position === "absolute" : null;
  });
  await browser.close();
}

// 4. Reduced motion on the real page.
{
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const consoleMessages = [];
  page.on("console", (m) => consoleMessages.push({ type: m.type(), text: m.text() }));
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.6));
  await page.waitForTimeout(100);
  const compressedState = await page.evaluate(() => ({
    compressed: document.documentElement.hasAttribute("data-hero-compressed"),
  }));

  await page.evaluate(() => {
    document.querySelector("section:nth-of-type(2)")?.scrollIntoView();
  });
  await page.waitForTimeout(150);
  await page.screenshot({ path: "m3-reduced-motion-journey.png" });

  const stage = page.locator("section:nth-of-type(2) .absolute.inset-0").last();
  const box = await stage.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);
    await page.waitForTimeout(100);
    const tooltip = await page.evaluate(
      () => document.querySelector(".border-plate-accent")?.textContent,
    );
    results.reducedMotionScrubStillWorks = !!tooltip;
  }
  results.reducedMotionCompressedState = compressedState;
  results.reducedMotionConsole = consoleMessages;
  await browser.close();
}

// 5. Rough CLS over the first second.
{
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000");
  results.cumulativeLayoutShift = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let total = 0;
        const obs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        });
        obs.observe({ type: "layout-shift", buffered: true });
        setTimeout(() => {
          obs.disconnect();
          resolve(total);
        }, 1000);
      }),
  );
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
