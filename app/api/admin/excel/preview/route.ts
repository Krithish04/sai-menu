import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { getMenu } from "@/lib/store";
import { MenuData, Section, Item, Price } from "@/types/menu";
import { MENU_GROUPS, getDefaultGroupForSection } from "@/lib/groups";

export const dynamic = "force-dynamic";

interface RowError {
  row: number;
  message: string;
}

interface PriceChange {
  itemName: string;
  category: string;
  column: string;
  oldPrice: number | null;
  newPrice: number | null;
}

function cleanString(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object" && "text" in (val as Record<string, unknown>)) {
    return String((val as { text: unknown }).text).trim();
  }
  return String(val).trim();
}

function parseFlag(val: unknown, rowNum: number, fieldName: string, errors: RowError[]): boolean {
  const str = cleanString(val).toLowerCase();
  if (!str || str === "no" || str === "n" || str === "false" || str === "૦" || str === "0") {
    return false;
  }
  if (str === "yes" || str === "y" || str === "true" || str === "૧" || str === "1") {
    return true;
  }
  errors.push({
    row: rowNum,
    message: `${fieldName} must be 'Yes' or 'No'`,
  });
  return false;
}

function parsePriceCell(val: unknown, rowNum: number, colName: string, errors: RowError[]): number | null {
  if (val === null || val === undefined) return null;

  // If cell is an object (rich text, formula, etc.)
  if (typeof val === "object") {
    if ("result" in (val as Record<string, unknown>)) {
      val = (val as { result: unknown }).result;
    } else if ("text" in (val as Record<string, unknown>)) {
      val = (val as { text: unknown }).text;
    }
  }

  const str = String(val).trim();
  if (str === "" || str === "—" || str === "-" || str === "N/A" || str === "na") {
    return null;
  }

  // If already a numeric type
  if (typeof val === "number" && !isNaN(val)) {
    if (val < 0) {
      errors.push({ row: rowNum, message: `${colName} price cannot be negative` });
      return null;
    }
    if (!Number.isInteger(val)) {
      errors.push({ row: rowNum, message: `${colName} price must be a whole number (no decimals)` });
      return null;
    }
    return val;
  }

  // Clean string format: remove commas, ₹ symbol, trailing /-
  const cleaned = str.replace(/[₹,]/g, "").replace(/\/-$/, "").trim();

  // Allow formats like "110" or "110.00"
  if (/^\d+\.00$/.test(cleaned)) {
    return parseInt(cleaned.split(".")[0], 10);
  }

  if (/^\d+$/.test(cleaned)) {
    return parseInt(cleaned, 10);
  }

  // Fractional decimal like "110.50"
  if (/^\d+\.\d+$/.test(cleaned)) {
    errors.push({ row: rowNum, message: `${colName} price must be a whole number (found: ${str})` });
    return null;
  }

  errors.push({ row: rowNum, message: `${colName} price must be a valid whole number (found: "${str}")` });
  return null;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isAuthorized = await verifySessionToken(token || "");

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. File size check (Max 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds 2 MB limit` },
        { status: 400 }
      );
    }

    // 2. File extension check
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx")) {
      return NextResponse.json(
        { error: "Only Excel .xlsx files are supported. Macros or CSV are not allowed." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as any);

    // 3. Security checks: check for macros or exceeding 2000 rows
    let totalRows = 0;
    workbook.eachSheet((ws) => {
      totalRows += ws.rowCount;
    });

    if (totalRows > 2000) {
      return NextResponse.json(
        { error: `File contains ${totalRows} rows, exceeding the 2000 row safety limit` },
        { status: 400 }
      );
    }

    // Check for "Menu" sheet
    const menuSheet = workbook.getWorksheet("Menu");
    if (!menuSheet) {
      return NextResponse.json(
        { error: "Missing required worksheet 'Menu'. Please download the template first." },
        { status: 400 }
      );
    }

    const errors: RowError[] = [];

    // 4. Formula check across "Menu" sheet
    menuSheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        if (cell.formula || (typeof cell.value === "object" && cell.value && "formula" in cell.value)) {
          errors.push({
            row: rowNumber,
            message: `Formulas are not permitted (cell ${cell.address})`,
          });
        }
      });
    });

    // 5. Header row validation on "Menu" sheet
    const headerRow = menuSheet.getRow(1);
    const headerMap = new Map<string, number>();
    headerRow.eachCell((cell, colNumber) => {
      headerMap.set(cleanString(cell.value).toLowerCase(), colNumber);
    });

    const requiredHeaders = [
      "group",
      "category (english)",
      "category (gujarati)",
      "item (english)",
      "item (gujarati)",
      "half",
      "full",
      "single",
      "plate",
      "oil",
      "butter",
      "sold out (yes/no)",
      "featured (yes/no)",
      "hidden (yes/no)",
    ];

    for (const reqH of requiredHeaders) {
      if (!headerMap.has(reqH)) {
        return NextResponse.json(
          { error: `Missing required column in 'Menu' sheet: "${reqH}". Please keep the original headers.` },
          { status: 400 }
        );
      }
    }

    // Helper to get cell by header name
    const getCell = (row: ExcelJS.Row, headerName: string) => {
      const colNum = headerMap.get(headerName.toLowerCase());
      return colNum ? row.getCell(colNum).value : null;
    };

    // 6. Optional "Categories" sheet parsing
    const catSheet = workbook.getWorksheet("Categories");
    const categoryConfigs = new Map<
      string,
      {
        gu?: string;
        group?: string;
        columnsType?: string;
        from?: string;
        to?: string;
        notesEn?: string;
        notesGu?: string;
        hidden?: boolean;
      }
    >();

    if (catSheet) {
      const catHeaderRow = catSheet.getRow(1);
      const catHeaderMap = new Map<string, number>();
      catHeaderRow.eachCell((cell, colNumber) => {
        catHeaderMap.set(cleanString(cell.value).toLowerCase(), colNumber);
      });

      catSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const catCol = catHeaderMap.get("category (english)");
        if (!catCol) return;
        const catName = cleanString(row.getCell(catCol).value);
        if (!catName) return;

        const getCatVal = (h: string) => {
          const col = catHeaderMap.get(h.toLowerCase());
          return col ? cleanString(row.getCell(col).value) : "";
        };

        const hiddenVal = getCatVal("hidden").toLowerCase();
        categoryConfigs.set(catName.toLowerCase(), {
          gu: getCatVal("gujarati"),
          group: getCatVal("group"),
          columnsType: getCatVal("columns type"),
          from: getCatVal("available from"),
          to: getCatVal("available to"),
          notesEn: getCatVal("notes (english)"),
          notesGu: getCatVal("notes (gujarati)"),
          hidden: hiddenVal === "yes" || hiddenVal === "true" || hiddenVal === "1",
        });
      });
    }

    // 7. Parse Data Rows on "Menu"
    const parsedSectionsMap = new Map<string, Section>();
    const sectionOrder: string[] = [];

    menuSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const catEn = cleanString(getCell(row, "category (english)"));
      const catGu = cleanString(getCell(row, "category (gujarati)"));
      const itemEn = cleanString(getCell(row, "item (english)"));
      const itemGu = cleanString(getCell(row, "item (gujarati)"));
      const groupName = cleanString(getCell(row, "group"));

      // If entirely empty row, skip
      if (!catEn && !itemEn) return;

      if (!catEn) {
        errors.push({ row: rowNumber, message: "Category (English) is required" });
        return;
      }
      if (!itemEn) {
        errors.push({ row: rowNumber, message: "Item (English) is required" });
        return;
      }

      // Parse prices
      const half = parsePriceCell(getCell(row, "half"), rowNumber, "Half", errors);
      const full = parsePriceCell(getCell(row, "full"), rowNumber, "Full", errors);
      const single = parsePriceCell(getCell(row, "single"), rowNumber, "Single", errors);
      const plate = parsePriceCell(getCell(row, "plate"), rowNumber, "Plate", errors);
      const oil = parsePriceCell(getCell(row, "oil"), rowNumber, "Oil", errors);
      const butter = parsePriceCell(getCell(row, "butter"), rowNumber, "Butter", errors);

      // Check that at least one price exists
      if (
        half === null &&
        full === null &&
        single === null &&
        plate === null &&
        oil === null &&
        butter === null
      ) {
        errors.push({
          row: rowNumber,
          message: `At least one price (Half, Full, Single, Plate, Oil, Butter) must be set for "${itemEn}"`,
        });
      }

      // Parse flags
      const soldOut = parseFlag(getCell(row, "sold out (yes/no)"), rowNumber, "Sold Out", errors);
      const featured = parseFlag(getCell(row, "featured (yes/no)"), rowNumber, "Featured", errors);
      const hidden = parseFlag(getCell(row, "hidden (yes/no)"), rowNumber, "Hidden", errors);

      const priceObj: Price = {};
      if (half !== null) priceObj.half = half;
      if (full !== null) priceObj.full = full;
      if (single !== null) {
        priceObj.single = single;
        priceObj.price = single;
      }
      if (plate !== null) priceObj.plate = plate;
      if (oil !== null) priceObj.oil = oil;
      if (butter !== null) priceObj.butter = butter;

      const catKey = catEn.toLowerCase();
      if (!parsedSectionsMap.has(catKey)) {
        sectionOrder.push(catKey);

        const catConf = categoryConfigs.get(catKey);
        const sectionId = catEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        // Map group ID
        let groupId = "south-indian";
        if (catConf?.group) {
          const match = MENU_GROUPS.find((g) => g.en.toLowerCase() === catConf.group?.toLowerCase());
          if (match) groupId = match.id;
        } else if (groupName) {
          const match = MENU_GROUPS.find((g) => g.en.toLowerCase() === groupName.toLowerCase());
          if (match) groupId = match.id;
        } else {
          groupId = getDefaultGroupForSection(sectionId);
        }

        // Determine columns
        let columns: string[] = ["price"];
        if (catConf?.columnsType === "half_full") columns = ["half", "full"];
        else if (catConf?.columnsType === "oil_butter") columns = ["oil", "butter"];
        else if (catConf?.columnsType === "single_plate") columns = ["single", "plate"];
        else {
          // Infer from item prices
          if (half !== null || full !== null) columns = ["half", "full"];
          else if (oil !== null || butter !== null) columns = ["oil", "butter"];
          else if (plate !== null) columns = ["single", "plate"];
        }

        const newSection: Section = {
          id: sectionId,
          en: catEn,
          gu: catGu || catConf?.gu || catEn,
          columns,
          items: [],
          group: groupId,
          hidden: hidden || catConf?.hidden || false,
        };

        if (catConf?.from && catConf?.to) {
          newSection.availability = { from: catConf.from, to: catConf.to };
        }

        if (catConf?.notesEn) {
          const notesEnArr = catConf.notesEn.split("|").map((s) => s.trim());
          const notesGuArr = (catConf.notesGu || "").split("|").map((s) => s.trim());
          newSection.notes = notesEnArr.map((en, idx) => ({
            en,
            gu: notesGuArr[idx] || en,
          }));
        }

        parsedSectionsMap.set(catKey, newSection);
      }

      const currentSection = parsedSectionsMap.get(catKey)!;
      const itemId = `${currentSection.id}-${itemEn.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

      const item: Item = {
        id: itemId,
        en: itemEn,
        gu: itemGu || itemEn,
        price: priceObj,
        soldOut: soldOut || undefined,
        featured: featured || undefined,
      };

      currentSection.items.push(item);
    });

    // If row validation failed, return the errors immediately
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors,
      });
    }

    // Build the candidate new MenuData
    const currentMenu = await getMenu();
    const newSections: Section[] = sectionOrder.map((key) => parsedSectionsMap.get(key)!);

    const proposedMenu: MenuData = {
      restaurant: currentMenu.restaurant,
      sections: newSections,
    };

    // 8. Calculate Diff with current live menu
    const oldItemsMap = new Map<string, { sectionEn: string; item: Item }>();
    for (const sec of currentMenu.sections) {
      for (const item of sec.items) {
        const key = `${sec.en.toLowerCase()}:::${item.en.toLowerCase()}`;
        oldItemsMap.set(key, { sectionEn: sec.en, item });
      }
    }

    const newItemsMap = new Map<string, { sectionEn: string; item: Item }>();
    for (const sec of proposedMenu.sections) {
      for (const item of sec.items) {
        const key = `${sec.en.toLowerCase()}:::${item.en.toLowerCase()}`;
        newItemsMap.set(key, { sectionEn: sec.en, item });
      }
    }

    let addedCount = 0;
    let removedCount = 0;
    let changedCount = 0;
    const priceChanges: PriceChange[] = [];

    // Find added & modified items
    for (const [key, { sectionEn, item: newItem }] of newItemsMap.entries()) {
      if (!oldItemsMap.has(key)) {
        addedCount++;
      } else {
        const { item: oldItem } = oldItemsMap.get(key)!;
        let isModified = false;

        // Check prices
        const priceCols = ["half", "full", "single", "plate", "oil", "butter"] as const;
        for (const col of priceCols) {
          const oldVal =
            col === "single"
              ? oldItem.price.single ?? oldItem.price.price ?? null
              : oldItem.price[col] ?? null;
          const newVal =
            col === "single"
              ? newItem.price.single ?? newItem.price.price ?? null
              : newItem.price[col] ?? null;

          if (oldVal !== newVal) {
            isModified = true;
            priceChanges.push({
              itemName: newItem.en,
              category: sectionEn,
              column: col.charAt(0).toUpperCase() + col.slice(1),
              oldPrice: oldVal,
              newPrice: newVal,
            });
          }
        }

        if (
          newItem.soldOut !== oldItem.soldOut ||
          newItem.featured !== oldItem.featured ||
          newItem.gu !== oldItem.gu
        ) {
          isModified = true;
        }

        if (isModified) {
          changedCount++;
        }
      }
    }

    // Find removed items
    for (const key of oldItemsMap.keys()) {
      if (!newItemsMap.has(key)) {
        removedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      errors: [],
      summary: {
        totalOldItems: oldItemsMap.size,
        totalNewItems: newItemsMap.size,
        categoriesCount: proposedMenu.sections.length,
        addedCount,
        removedCount,
        changedCount,
        priceChanges,
      },
      parsedMenu: proposedMenu,
    });
  } catch (err: unknown) {
    console.error("Excel preview parsing error:", err);
    return NextResponse.json(
      { error: "Failed to read Excel file. Please ensure it is a valid .xlsx workbook." },
      { status: 400 }
    );
  }
}
