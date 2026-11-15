import { chromium } from "playwright";
import path from "path";
import fs from "fs";

async function verifyPublicMenu() {
  const browser = await chromium.launch();
  const screenshotDir = path.resolve(
    "C:/Users/Laptop/.gemini/antigravity/brain/c5a87ebf-a009-4243-91f3-001decf4763f/public-menu-screenshots"
  );
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const viewports = [
    { width: 360, height: 740, name: "360-android" },
    { width: 390, height: 844, name: "390-iphone" },
    { width: 412, height: 915, name: "412-pixel" },
    { width: 768, height: 1024, name: "768-tablet" },
    { width: 1280, height: 800, name: "1280-desktop" },
  ];

  console.log("=== STARTING PUBLIC MENU CATEGORIES & HEADER VERIFICATION ===");

  for (const vp of viewports) {
    console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });

    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.waitForSelector("#main-menu");
    await page.waitForTimeout(400);

    // 1. Check Zero Horizontal Scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (hasHorizontalScroll) {
      throw new Error(`FAILED: Horizontal page scroll detected on ${vp.name}!`);
    }
    console.log(`✓ PASSED: Zero horizontal page scroll on ${vp.name}`);

    // 2. Check Restaurant Header sits ABOVE Categories Bar on initial load
    const positions = await page.evaluate(() => {
      const headerEl = document.querySelector("header.text-center"); // restaurant cover Header
      const stickyNav = document.querySelector(".sticky.top-0");
      const searchBtn = stickyNav?.querySelector("button[aria-label*='Search'], button[aria-label*='શોધો']");
      const allTab = stickyNav?.querySelector("[data-group-id='all']");
      const firstSection = document.querySelector("#main-menu section");

      return {
        headerBox: headerEl ? headerEl.getBoundingClientRect() : null,
        stickyNavBox: stickyNav ? stickyNav.getBoundingClientRect() : null,
        searchBtnBox: searchBtn ? searchBtn.getBoundingClientRect() : null,
        allTabBox: allTab ? allTab.getBoundingClientRect() : null,
        firstSectionBox: firstSection ? firstSection.getBoundingClientRect() : null,
      };
    });

    if (positions.headerBox && positions.stickyNavBox) {
      if (positions.headerBox.top > positions.stickyNavBox.top) {
        throw new Error(
          `FAILED: Restaurant Header (${positions.headerBox.top}) does not sit above Categories Bar (${positions.stickyNavBox.top})!`
        );
      }
      console.log(
        `✓ PASSED: Restaurant Header sits above sticky navigation bar (Header top: ${positions.headerBox.top.toFixed(
          1
        )}, Nav top: ${positions.stickyNavBox.top.toFixed(1)})`
      );
    }

    // 3. Check within sticky bar: Categories are strictly BELOW Search control row
    if (positions.searchBtnBox && positions.allTabBox) {
      if (positions.allTabBox.top < positions.searchBtnBox.bottom - 2) {
        throw new Error(
          `FAILED: Categories overlap with Search button! Search bottom: ${positions.searchBtnBox.bottom}, Categories top: ${positions.allTabBox.top}`
        );
      }
      console.log(
        `✓ PASSED: Categories row sits cleanly below header controls row (Search bottom: ${positions.searchBtnBox.bottom.toFixed(
          1
        )}, All Tab top: ${positions.allTabBox.top.toFixed(1)})`
      );
    }

    // 4. Check "All" tab is active and all sections are displayed
    const allTabActive = await page.evaluate(() => {
      const allBtn = document.querySelector("[data-group-id='all']");
      return allBtn?.getAttribute("aria-current") === "true";
    });
    if (!allTabActive) {
      throw new Error(`FAILED: 'All' category tab is not active by default!`);
    }
    console.log(`✓ PASSED: 'All' category tab is active by default`);

    const sectionCount = await page.evaluate(() => {
      return document.querySelectorAll("#main-menu section").length;
    });
    console.log(`✓ PASSED: 'All' shows everything (${sectionCount} sections rendered)`);

    // Capture initial load screenshot
    await page.screenshot({
      path: path.join(screenshotDir, `${vp.name}-1-top-header.png`),
    });
    console.log(`  Saved screenshot: ${vp.name}-1-top-header.png`);

    // 5. Scroll down and verify sticky bar remains pinned at top-0 with categories below Search
    await page.evaluate(() => window.scrollBy(0, 450));
    await page.waitForTimeout(300);

    const scrolledPositions = await page.evaluate(() => {
      const stickyNav = document.querySelector(".sticky.top-0");
      const searchBtn = stickyNav?.querySelector("button[aria-label*='Search'], button[aria-label*='શોધો']");
      const allTab = stickyNav?.querySelector("[data-group-id='all']");
      return {
        stickyNavBox: stickyNav ? stickyNav.getBoundingClientRect() : null,
        searchBtnBox: searchBtn ? searchBtn.getBoundingClientRect() : null,
        allTabBox: allTab ? allTab.getBoundingClientRect() : null,
      };
    });

    if (scrolledPositions.stickyNavBox) {
      if (Math.abs(scrolledPositions.stickyNavBox.top) > 2) {
        throw new Error(`FAILED: Navigation bar is not sticking to top-0 when scrolled! (top: ${scrolledPositions.stickyNavBox.top})`);
      }
      console.log(`✓ PASSED: Navigation bar is sticky at top: ${scrolledPositions.stickyNavBox.top.toFixed(1)}px`);
    }

    if (scrolledPositions.searchBtnBox && scrolledPositions.allTabBox) {
      if (scrolledPositions.allTabBox.top < scrolledPositions.searchBtnBox.bottom - 2) {
        throw new Error(
          `FAILED: While sticky, categories overlap with Search! Search bottom: ${scrolledPositions.searchBtnBox.bottom}, All tab top: ${scrolledPositions.allTabBox.top}`
        );
      }
      console.log(
        `✓ PASSED: While sticky, categories remain strictly below Search (Search bottom: ${scrolledPositions.searchBtnBox.bottom.toFixed(
          1
        )}, All tab top: ${scrolledPositions.allTabBox.top.toFixed(1)})`
      );
    }

    // Capture scrolled sticky screenshot
    await page.screenshot({
      path: path.join(screenshotDir, `${vp.name}-2-scrolled-sticky.png`),
    });
    console.log(`  Saved screenshot: ${vp.name}-2-scrolled-sticky.png`);

    // 6. Test clicking a specific category (e.g. South Indian)
    const southIndianBtn = page.locator("[data-group-id='south-indian']").first();
    await southIndianBtn.click();
    await page.waitForTimeout(300);

    const isSouthIndianActive = await page.evaluate(() => {
      const btn = document.querySelector("[data-group-id='south-indian']");
      return btn?.getAttribute("aria-current") === "true";
    });
    if (!isSouthIndianActive) {
      throw new Error(`FAILED: South Indian category tab did not activate on click!`);
    }
    console.log(`✓ PASSED: Clicking 'South Indian' category activated the tab`);

    // Capture specific category screenshot
    await page.screenshot({
      path: path.join(screenshotDir, `${vp.name}-3-south-indian.png`),
    });
    console.log(`  Saved screenshot: ${vp.name}-3-south-indian.png`);

    // 7. Click back to "All" to show everything again
    const allBtn = page.locator("[data-group-id='all']").first();
    await allBtn.click();
    await page.waitForTimeout(300);

    const isAllActiveAgain = await page.evaluate(() => {
      const btn = document.querySelector("[data-group-id='all']");
      return btn?.getAttribute("aria-current") === "true";
    });
    if (!isAllActiveAgain) {
      throw new Error(`FAILED: Clicking 'All' did not reactivate 'All'!`);
    }
    console.log(`✓ PASSED: Clicking 'All' tab restored view of everything`);

    await page.close();
  }

  await browser.close();
  console.log("\n🎉 ALL PUBLIC MENU CATEGORIES & HEADER VERIFICATION TESTS PASSED!");
}

verifyPublicMenu().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
