import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { getMenu } from "@/lib/store";
import { MENU_GROUPS, getDefaultGroupForSection } from "@/lib/groups";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isAuthorized = await verifySessionToken(token || "");

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const menu = await getMenu();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Shree Sai Restaurant";
  workbook.created = new Date();

  // Color palette
  const indigoHeaderFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF141B42" }, // Brand Indigo
  };
  const ribbonSubheaderFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFB8222B" }, // Brand Ribbon Red
  };
  const headerFont: Partial<ExcelJS.Font> = {
    bold: true,
    color: { argb: "FFFFFFFF" },
    size: 11,
    name: "Calibri",
  };
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFE2D2B8" } },
    left: { style: "thin", color: { argb: "FFE2D2B8" } },
    bottom: { style: "thin", color: { argb: "FFE2D2B8" } },
    right: { style: "thin", color: { argb: "FFE2D2B8" } },
  };

  // ----------------------------------------------------
  // SHEET 1: "Menu" (One row per item)
  // ----------------------------------------------------
  const menuSheet = workbook.addWorksheet("Menu");
  menuSheet.views = [{ state: "frozen", ySplit: 1 }];

  menuSheet.columns = [
    { header: "Group", key: "group", width: 22 },
    { header: "Category (English)", key: "catEn", width: 22 },
    { header: "Category (Gujarati)", key: "catGu", width: 22 },
    { header: "Item (English)", key: "itemEn", width: 28 },
    { header: "Item (Gujarati)", key: "itemGu", width: 28 },
    { header: "Half", key: "half", width: 11 },
    { header: "Full", key: "full", width: 11 },
    { header: "Single", key: "single", width: 11 },
    { header: "Plate", key: "plate", width: 11 },
    { header: "Oil", key: "oil", width: 11 },
    { header: "Butter", key: "butter", width: 11 },
    { header: "Sold Out (Yes/No)", key: "soldOut", width: 18 },
    { header: "Featured (Yes/No)", key: "featured", width: 18 },
    { header: "Hidden (Yes/No)", key: "hidden", width: 16 },
  ];

  // Style Header Row
  const menuHeaderRow = menuSheet.getRow(1);
  menuHeaderRow.height = 28;
  menuHeaderRow.font = headerFont;
  menuHeaderRow.fill = indigoHeaderFill;
  menuHeaderRow.alignment = { vertical: "middle", horizontal: "center" };

  // Populate Menu Items
  for (const section of menu.sections) {
    const groupName =
      MENU_GROUPS.find((g) => g.id === (section.group || getDefaultGroupForSection(section.id)))?.en ||
      "South Indian";

    for (const item of section.items) {
      // Determine single price: could be stored in single or price
      const singlePrice = item.price.single ?? item.price.price;

      const row = menuSheet.addRow({
        group: groupName,
        catEn: section.en,
        catGu: section.gu,
        itemEn: item.en,
        itemGu: item.gu,
        half: item.price.half ?? null,
        full: item.price.full ?? null,
        single: singlePrice ?? null,
        plate: item.price.plate ?? null,
        oil: item.price.oil ?? null,
        butter: item.price.butter ?? null,
        soldOut: item.soldOut ? "Yes" : "No",
        featured: item.featured ? "Yes" : "No",
        hidden: section.hidden ? "Yes" : "No",
      });

      row.height = 22;
      row.alignment = { vertical: "middle" };

      // Number formatting & cell borders
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = thinBorder;

        // Price columns (cols 6 to 11: Half, Full, Single, Plate, Oil, Butter)
        if (colNumber >= 6 && colNumber <= 11) {
          cell.numFmt = "#,##0";
          cell.alignment = { vertical: "middle", horizontal: "right" };
        }

        // Flag columns (cols 12, 13, 14: Sold Out, Featured, Hidden)
        if (colNumber >= 12 && colNumber <= 14) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: ['"Yes,No"'],
            showErrorMessage: true,
            errorTitle: "Invalid Value",
            error: "Please select either 'Yes' or 'No'.",
          };
        }
      });
    }
  }

  // ----------------------------------------------------
  // SHEET 2: "Categories"
  // ----------------------------------------------------
  const catSheet = workbook.addWorksheet("Categories");
  catSheet.views = [{ state: "frozen", ySplit: 1 }];

  catSheet.columns = [
    { header: "Category (English)", key: "en", width: 24 },
    { header: "Gujarati", key: "gu", width: 24 },
    { header: "Group", key: "group", width: 22 },
    { header: "Columns type", key: "columnsType", width: 18 },
    { header: "Available from", key: "from", width: 16 },
    { header: "Available to", key: "to", width: 16 },
    { header: "Notes (English)", key: "notesEn", width: 36 },
    { header: "Notes (Gujarati)", key: "notesGu", width: 36 },
    { header: "Hidden", key: "hidden", width: 14 },
  ];

  const catHeaderRow = catSheet.getRow(1);
  catHeaderRow.height = 28;
  catHeaderRow.font = headerFont;
  catHeaderRow.fill = ribbonSubheaderFill;
  catHeaderRow.alignment = { vertical: "middle", horizontal: "center" };

  for (const section of menu.sections) {
    const groupName =
      MENU_GROUPS.find((g) => g.id === (section.group || getDefaultGroupForSection(section.id)))?.en ||
      "South Indian";

    let colTypeStr = "single";
    const cols = section.columns as string[];
    if (cols.includes("half") && cols.includes("full")) colTypeStr = "half_full";
    else if (cols.includes("oil") && cols.includes("butter")) colTypeStr = "oil_butter";
    else if (cols.includes("single") && cols.includes("plate")) colTypeStr = "single_plate";

    const row = catSheet.addRow({
      en: section.en,
      gu: section.gu,
      group: groupName,
      columnsType: colTypeStr,
      from: section.availability?.from || "",
      to: section.availability?.to || "",
      notesEn: section.notes?.map((n) => n.en).join(" | ") || "",
      notesGu: section.notes?.map((n) => n.gu || "").join(" | ") || "",
      hidden: section.hidden ? "Yes" : "No",
    });

    row.height = 22;
    row.alignment = { vertical: "middle" };

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = thinBorder;
      if (colNumber === 9) {
        // Hidden column dropdown
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: ['"Yes,No"'],
          showErrorMessage: true,
          errorTitle: "Invalid Value",
          error: "Please select either 'Yes' or 'No'.",
        };
      }
    });
  }

  // ----------------------------------------------------
  // SHEET 3: "Read me" (Plain English instructions)
  // ----------------------------------------------------
  const readMeSheet = workbook.addWorksheet("Read me");
  readMeSheet.columns = [
    { header: "Section", key: "topic", width: 28 },
    { header: "Instructions for Restaurant Owner & Staff", key: "guide", width: 85 },
  ];

  const readMeHeader = readMeSheet.getRow(1);
  readMeHeader.height = 28;
  readMeHeader.font = headerFont;
  readMeHeader.fill = indigoHeaderFill;
  readMeHeader.alignment = { vertical: "middle", horizontal: "left" };

  const guides = [
    {
      topic: "1. How to Edit Prices",
      guide: "Go to the 'Menu' sheet. Enter whole numbers in the price columns (e.g., 60, 110). Leave the cell empty if that dish is not sold in that size. Do not write currency symbols like ₹.",
    },
    {
      topic: "2. Sold Out Items",
      guide: "In the 'Sold Out (Yes/No)' column, select 'Yes' from the dropdown to mark a dish unavailable for the day. Customers will see it muted with a clean strikethrough. Select 'No' to make it available again.",
    },
    {
      topic: "3. Featured / Sai Special",
      guide: "In the 'Featured (Yes/No)' column, choose 'Yes' to badge the item with a gold 'Sai Special' star and display it in the curated shelf at the top of its section.",
    },
    {
      topic: "4. Adding New Dishes",
      guide: "Insert a new row in the 'Menu' sheet under the appropriate category. Fill in Category (English), Item (English), Item (Gujarati), and at least one price. Set Sold Out to 'No'.",
    },
    {
      topic: "5. Column Types & Categories",
      guide: "The 'Categories' sheet controls section settings like column layouts ('single', 'single_plate', 'oil_butter', 'half_full'), operating hours, and footer notes.",
    },
    {
      topic: "6. Do Not Rename Headers",
      guide: "CRITICAL: Do NOT change, rename, or delete the column header titles in Row 1 of any sheet. The automated uploader requires exact names.",
    },
    {
      topic: "7. Safe Upload & Backup",
      guide: "When you upload this file in the Admin panel, you will see a full comparison preview of all changes before anything is saved. An automatic backup snapshot is always preserved in History.",
    },
  ];

  for (const g of guides) {
    const row = readMeSheet.addRow(g);
    row.height = 36;
    row.alignment = { vertical: "middle", wrapText: true };
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = thinBorder;
      if (colNumber === 1) cell.font = { bold: true, color: { argb: "FF141B42" } };
    });
  }

  // Generate buffer and send response
  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split("T")[0];

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="shree-sai-menu-${dateStr}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
