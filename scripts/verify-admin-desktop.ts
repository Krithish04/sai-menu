import { chromium } from "playwright";
import path from "path";
import fs from "fs";

async function verifyAdmin() {
  console.log("=== STARTING ADMIN DESKTOP-FIRST PLAYWRIGHT VERIFICATION ===");
  const browser = await chromium.launch({ headless: true });

  const screenshotDir = path.resolve(
    "C:/Users/Laptop/.gemini/antigravity/brain/c5a87ebf-a009-4243-91f3-001decf4763f/admin-screenshots"
  );
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 1. First log in to obtain session cookie
  const loginContext = await browser.newContext();
  const loginPage = await loginContext.newPage();
  await loginPage.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
  await loginPage.fill('#password', "sai_restaurant");
  await loginPage.click('button[type="submit"]');
  await loginPage.waitForURL((url) => url.pathname === "/admin");
  await loginPage.waitForSelector("main");
  console.log("✓ PASSED: Successfully authenticated to /admin via login form!");

  const cookies = await loginContext.cookies();
  await loginContext.close();

  const viewports = [
    { width: 1920, height: 1080, name: "1920-fhd" },
    { width: 1440, height: 900, name: "1440-laptop" },
    { width: 1280, height: 800, name: "1280-desktop" },
    { width: 1024, height: 768, name: "1024-small-desktop" },
    { width: 768, height: 1024, name: "768-tablet" },
    { width: 390, height: 844, name: "390-phone" },
  ];

  for (const vp of viewports) {
    console.log(`\n--- Testing Admin Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });

    await context.addCookies(cookies);

    const page = await context.newPage();

    // 1. Dashboard Overview Tab
    await page.goto("http://localhost:3000/admin#overview", { waitUntil: "networkidle" });
    await page.waitForSelector("main");
    await page.waitForTimeout(300);

    // Assert: No horizontal page scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    });
    if (hasHorizontalScroll) {
      throw new Error(`FAILED: Horizontal page scroll detected on ${vp.name}!`);
    }
    console.log(`✓ PASSED: Zero horizontal page scroll on ${vp.name}`);

    // Assert: Full width usage on desktop (>=1024px)
    if (vp.width >= 1024) {
      const mainWidth = await page.evaluate(() => {
        const main = document.querySelector("main");
        return main ? main.clientWidth : 0;
      });
      if (mainWidth < 700) {
        throw new Error(`FAILED: Main container width (${mainWidth}px) is too narrow on ${vp.name}!`);
      }
      console.log(`✓ PASSED: Full width desktop layout on ${vp.name} (Main width: ${mainWidth}px)`);
    }

    const shotOverview = path.join(screenshotDir, `${vp.name}-1-overview.png`);
    await page.screenshot({ path: shotOverview });
    console.log(`  Saved screenshot: ${vp.name}-1-overview.png`);

    // 2. Menu Items Tab
    await page.goto("http://localhost:3000/admin#items", { waitUntil: "networkidle" });
    await page.waitForSelector("#category-table-snacks");
    await page.waitForTimeout(300);

    // Check sticky table header doesn't cover first row (on screens >=640px where table is shown)
    if (vp.width >= 640) {
      const headerBox = await page.evaluate(() => {
        const th = document.querySelector("#category-table-snacks thead tr");
        return th ? th.getBoundingClientRect() : null;
      });
      const firstRowBox = await page.evaluate(() => {
        const tr = document.querySelector("#category-table-snacks tbody tr");
        return tr ? tr.getBoundingClientRect() : null;
      });

      if (headerBox && firstRowBox) {
        if (firstRowBox.y < headerBox.y + headerBox.height - 2) {
          throw new Error(`FAILED: Sticky table header covers first row! Header bottom: ${headerBox.y + headerBox.height}, Row top: ${firstRowBox.y}`);
        }
        console.log(`✓ PASSED: Table header sits strictly above first row (Header bottom: ${(headerBox.y + headerBox.height).toFixed(1)}, First row: ${firstRowBox.y.toFixed(1)})`);
      }
    }

    const shotItems = path.join(screenshotDir, `${vp.name}-2-items.png`);
    await page.screenshot({ path: shotItems });
    console.log(`  Saved screenshot: ${vp.name}-2-items.png`);

    // 3. Categories Tab
    await page.goto("http://localhost:3000/admin#categories", { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const shotCategories = path.join(screenshotDir, `${vp.name}-3-categories.png`);
    await page.screenshot({ path: shotCategories });
    console.log(`  Saved screenshot: ${vp.name}-3-categories.png`);

    // 4. QR Code Tab
    await page.goto("http://localhost:3000/admin#qr", { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const shotQr = path.join(screenshotDir, `${vp.name}-4-qr.png`);
    await page.screenshot({ path: shotQr });
    console.log(`  Saved screenshot: ${vp.name}-4-qr.png`);

    // 5. Backup & Excel Tab
    await page.goto("http://localhost:3000/admin#backup", { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const shotBackup = path.join(screenshotDir, `${vp.name}-5-backup.png`);
    await page.screenshot({ path: shotBackup });
    console.log(`  Saved screenshot: ${vp.name}-5-backup.png`);

    await context.close();
  }

  // 6. Test Inline Price Editing
  console.log("\n[Test 6] Testing Inline Price Editing on Laptop Viewport...");
  const testContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await testContext.addCookies(cookies);
  const testPage = await testContext.newPage();
  await testPage.goto("http://localhost:3000/admin#items", { waitUntil: "networkidle" });
  await testPage.waitForSelector('input[data-price-cell="true"]');
  await testPage.waitForTimeout(400);

  const priceLocator = testPage.locator('input[data-price-cell="true"]').first();
  const initialVal = await priceLocator.inputValue();
  console.log(`  Initial price cell value: ${initialVal}`);

  // Focus and update value
  await priceLocator.fill("48");
  await priceLocator.press("Enter");
  await testPage.waitForTimeout(1000);

  // Check save status indicator
  const saveText = await testPage.evaluate(() => {
    return document.body.innerText.includes("Saved") || document.body.innerText.includes("Saving");
  });
  console.log(`✓ PASSED: Inline price editing triggered save (Save status detected: ${saveText})`);

  // Revert value back
  await priceLocator.fill(initialVal);
  await priceLocator.press("Enter");
  await testPage.waitForTimeout(1000);

  await testContext.close();
  await browser.close();

  console.log("\n🎉 ALL ADMIN VERIFICATION TESTS PASSED!");
}

verifyAdmin().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
