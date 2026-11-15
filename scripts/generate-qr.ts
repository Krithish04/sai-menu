import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { PNG } from "pngjs";
import jsQR from "jsqr";

// Load environment variables if available
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

const QR_DIR = path.join(process.cwd(), "qr");
const PUBLIC_QR_DIR = path.join(process.cwd(), "public", "qr");

async function generateAllQRCodes() {
  console.log("==================================================");
  console.log("       SHREE SAI RESTAURANT - QR GENERATOR        ");
  console.log("==================================================");
  console.log(`Base Site URL: ${siteUrl}`);

  // Ensure directories exist
  [QR_DIR, PUBLIC_QR_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const qrOptions: QRCode.QRCodeToFileOptions = {
    errorCorrectionLevel: "H",
    margin: 4,
    width: 1200,
    color: {
      dark: "#141B42", // Brand Indigo
      light: "#FFFFFF",
    },
  };

  const qrSvgOptions: QRCode.QRCodeToStringOptions = {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 4,
    color: {
      dark: "#141B42",
      light: "#FFFFFF",
    },
  };

  // 1. Generate Main Menu QR Code (SVG & PNG)
  console.log("\nGenerating master menu QR codes...");
  const menuUrl = siteUrl;

  const svgContent = await QRCode.toString(menuUrl, qrSvgOptions);
  [QR_DIR, PUBLIC_QR_DIR].forEach((dir) => {
    fs.writeFileSync(path.join(dir, "menu-qr.svg"), svgContent);
  });

  await QRCode.toFile(path.join(QR_DIR, "menu-qr.png"), menuUrl, qrOptions);
  fs.copyFileSync(
    path.join(QR_DIR, "menu-qr.png"),
    path.join(PUBLIC_QR_DIR, "menu-qr.png")
  );
  console.log("✓ Created menu-qr.svg and menu-qr.png (1200px, Error Level H)");

  // 2. Generate Table 1 to Table 20 QR Codes
  console.log("\nGenerating Table 1 to Table 20 QR codes...");
  for (let table = 1; table <= 20; table++) {
    const tableUrl = `${siteUrl}/?t=${table}`;
    const filename = `table-${table}.png`;
    const destPath = path.join(QR_DIR, filename);

    await QRCode.toFile(destPath, tableUrl, qrOptions);
    fs.copyFileSync(destPath, path.join(PUBLIC_QR_DIR, filename));
  }
  console.log("✓ Created table-1.png through table-20.png (1200px each)");

  // 3. Decode & Verify Scan
  console.log("\nDecoding verification scan test...");
  const testFile = path.join(QR_DIR, "table-5.png");
  const testExpected = `${siteUrl}/?t=5`;

  const imgData = fs.readFileSync(testFile);
  const png = PNG.sync.read(imgData);
  const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

  if (!code) {
    console.error("❌ QR code decoding failed! Could not find QR code in image.");
    process.exit(1);
  }

  console.log(`Expected URL: ${testExpected}`);
  console.log(`Decoded  URL: ${code.data}`);

  if (code.data === testExpected) {
    console.log("✓ SUCCESS: QR code decoded perfectly and matches expected URL!");
  } else {
    console.error(`❌ Mismatch: decoded ${code.data} vs expected ${testExpected}`);
    process.exit(1);
  }

  // Summary
  const qrFiles = fs.readdirSync(QR_DIR);
  console.log("==================================================");
  console.log(`Generated ${qrFiles.length} QR assets in /qr and /public/qr:`);
  qrFiles.forEach((file) => {
    const stat = fs.statSync(path.join(QR_DIR, file));
    console.log(`  - ${file.padEnd(16)} ${(stat.size / 1024).toFixed(1)} KB`);
  });
  console.log("==================================================");
  console.log("🎉 QR generation & scan proof complete!");
}

generateAllQRCodes().catch((err) => {
  console.error("QR Generation error:", err);
  process.exit(1);
});
