import { INITIAL_MENU } from "../data/menu";

function checkMenu() {
  console.log("==================================================");
  console.log("   SHREE SAI RESTAURANT - MENU VERIFICATION       ");
  console.log("==================================================");
  console.log(`Restaurant: ${INITIAL_MENU.restaurant.name} (${INITIAL_MENU.restaurant.guName})`);
  console.log(`Location:   ${INITIAL_MENU.restaurant.address}, ${INITIAL_MENU.restaurant.city}`);
  console.log(`Phones:     ${INITIAL_MENU.restaurant.phones.join(", ")}`);
  console.log(`Since:      ${INITIAL_MENU.restaurant.since}`);
  console.log("--------------------------------------------------");

  let totalItems = 0;
  const seenIds = new Set<string>();
  const duplicates: string[] = [];
  const missingGujarati: string[] = [];
  const invalidPrices: string[] = [];

  INITIAL_MENU.sections.forEach((sec, idx) => {
    const itemCount = sec.items.length;
    totalItems += itemCount;
    const avail = sec.availability ? ` [🕒 ${sec.availability.from} - ${sec.availability.to}]` : "";
    const cols = `[cols: ${sec.columns.join("/")}]`;
    const notesCount = sec.notes ? ` [${sec.notes.length} note(s)]` : "";

    console.log(
      `${(idx + 1).toString().padStart(2, " ")}. ${sec.en.padEnd(24, " ")} | ${sec.gu.padEnd(20, " ")} | ${itemCount.toString().padStart(2, " ")} items ${cols}${avail}${notesCount}`
    );

    sec.items.forEach((item) => {
      // Check ID uniqueness
      if (seenIds.has(item.id)) {
        duplicates.push(item.id);
      } else {
        seenIds.add(item.id);
      }

      // Check Gujarati name
      if (!item.gu || item.gu.trim().length === 0) {
        missingGujarati.push(`${sec.en} -> ${item.en}`);
      }

      // Check prices
      const prices = Object.values(item.price);
      if (prices.length === 0 || prices.some((p) => typeof p !== "number" || p <= 0)) {
        invalidPrices.push(`${sec.en} -> ${item.en} (${JSON.stringify(item.price)})`);
      }
    });
  });

  console.log("==================================================");
  console.log(`TOTAL SECTIONS:    ${INITIAL_MENU.sections.length}`);
  console.log(`TOTAL MENU ITEMS:  ${totalItems}`);
  console.log("--------------------------------------------------");

  let hasErrors = false;

  if (duplicates.length > 0) {
    console.error(`❌ Duplicate item IDs found: ${duplicates.join(", ")}`);
    hasErrors = true;
  } else {
    console.log("✓ All item IDs are unique");
  }

  if (missingGujarati.length > 0) {
    console.warn(`⚠️ Items with missing Gujarati names: ${missingGujarati.join(", ")}`);
  } else {
    console.log("✓ All items have Gujarati names transcribed");
  }

  if (invalidPrices.length > 0) {
    console.error(`❌ Invalid prices found: ${invalidPrices.join(", ")}`);
    hasErrors = true;
  } else {
    console.log("✓ All item prices are valid positive numbers");
  }

  console.log("==================================================");

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log("🎉 Menu data verification PASSED!");
  }
}

checkMenu();
