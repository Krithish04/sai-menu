# Shree Sai Restaurant — Digital Menu

> **Salabatpura, Surat — Est. 1989**  
> Authentic South Indian, Pav Bhaji, Chinese & Fast Food.  
> Pure Vegetarian Taste & Quality.

A mobile-first, QR-opened digital menu website built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**. Backed by **Upstash Redis** with snapshot history, offline fallback, and a password-protected `/admin` management panel.

Designed to feel like a high-grade printed family restaurant menu — warm cream background, deep indigo typography, ribbon red accent tags, Fraunces serif headings, Mukta sans body, Noto Serif Gujarati, aligned dotted leaders, and multi-price columns — with zero "generic AI template" look.

---

## 🏆 Lighthouse Performance & Quality

The public menu achieves **100/100** across all audit categories:

| Category | Score | Real-World Measurement |
| :--- | :---: | :--- |
| **Performance** | **100** | **FCP:** 0.9s · **LCP:** 0.9s · **TBT:** 80ms · **CLS:** 0.001 |
| **Accessibility** | **100** | WCAG AA contrast (4.5:1+), 44px minimum tap targets, screen-reader landmarks |
| **Best Practices**| **100** | HTTPS/localhost ready, modern doctype, 0 console errors |
| **SEO** | **100** | Static meta tags, Open Graph, Schema.org `Restaurant` JSON-LD |

---

## 📋 Features

- **Mobile-First Menu**: Optimized for single-handed phone browsing (320px to 430px), tablets, and desktop computers.
- **Two-Level Navigation & Swipe**: Top-level group tabs (`South Indian`, `Pav Bhaji & Pulav`, `Sandwich & Grill`, `Pizza & Burger`, `Chinese`, `Drinks`) with sub-level section chips. Full touch swiping (left/right) between groups on mobile and desktop navigation arrows.
- **Collapsible Section Accordions**: Sections default to first-open with remaining collapsed showing dish counts, plus a global "Expand all / Collapse all" control — reducing mobile scroll height by >80%.
- **Responsive Multi-Screen Layout**: 1 column on mobile phones (up to 480px), 2 columns on tablets and landscape phones (from 640px), 3 columns on desktop (from 1100px), with desktop sticky left-rail group navigation.
- **Popular / Sai Special Highlights**: Dishes marked as `featured` display a gold "Sai Special" star badge and are curated into a highlighted shelf at the top of their category group.
- **Brand-Aligned Night Mode**: Deep indigo paper (`#0F1433`) with warm cream text (`#F2E8D5`) and crimson accents, honoring `prefers-color-scheme` with manual toggle saved in `localStorage`.
- **Bilingual & 3-Way Mode (English / ગુજરાતી / Both)**: Instant language switcher. "Both" mode displays the primary language with the alternative language as a subtitle.
- **Instant Search**: Collapsible search matching both English and Gujarati dish and category names in real-time.
- **Table QR Support (`?t=N`)**: When opened via table QR code, displays a subtle `Table N` badge in the header.
- **Time-Based Availability**: Enforces availability rules in Asia/Kolkata time (e.g. Pav Bhaji & Pizza available 1:00 pm – 11:00 pm).
- **Printable Table Tents (`/print/qr`)**: Dedicated print stylesheet generating A6 table tent cards (4 per A4 page) for Tables 1–20 and Master Menu with cut & fold guides.
- **QR Asset Generation (`npm run qr`)**: CLI tool generating SVG & PNG QR codes for the master menu and all 20 individual tables.
- **Admin Dashboard (`/admin`)**:
  - Inline price editing with numeric keypad and auto-save on blur/Enter.
  - "Not Today" sold-out toggle with strikethrough and muted styling on the public menu.
  - "Sai Special" featured toggle (star icon) to showcase signature dishes in the group highlight shelf.
  - Assign categories to specific groups (`South Indian`, `Pav Bhaji & Pulav`, etc.) in category settings.
  - Add, delete, and rename dishes (English & Gujarati).
  - Reorder dishes and move dishes between categories.
  - Category manager: rename, reorder, change column types, set availability hours, edit notes, hide/show.
  - Bulk price changer: increase/decrease prices by ±₹ or ±% with live preview before applying.
  - Snapshot history: last 30 edits recorded with one-click restore.
  - Backup & restore: Export menu to JSON, import JSON, or factory reset to the original 1989 menu.
  - Instant cache invalidation via `revalidatePath('/')`.
- **Hardened Security**:
  - Admin protected by timing-safe password comparison.
  - 7-day signed `httpOnly`, `sameSite=lax` JWT session cookie via `jose`.
  - Rate limiting in Redis: max 5 failed attempts per 15-minute sliding window per IP.
  - Origin / CSRF validation on all admin API routes.
  - Zod server-side schema validation on all writes.
  - Admin routes blocked from search engines (`noindex, nofollow`).
- **Resilient Fallback**: If Redis is not configured or temporarily unreachable, the menu seamlessly falls back to local data (`data/menu.ts`) without crashing.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** 18.18+ or 20+
- **npm** 9+

### 2. Clone & Install
```bash
git clone <repository-url>
cd Menu
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your values (see [Environment Variables](#-environment-variables) below).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Verification & Production Build
```bash
# Verify all 17 menu sections, 143 dishes, and Gujarati transliterations
npm run check-menu

# Generate master and table 1-20 QR code PNGs/SVGs and verify scan decoding
npm run qr

# Run production linter and type-checking
npm run lint

# Build optimized production bundle
npm run build
```

---

## 🔑 Environment Variables

Configure these in `.env.local` (local) and Vercel Project Settings (production):

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `ADMIN_PASSWORD` | **Yes** | Master password to log in to `/admin` | `ShreeSai@Surat1989!` |
| `AUTH_SECRET` | **Yes** | 32+ character random string for signing JWT tokens | `generate-via-openssl-rand-hex-32` |
| `UPSTASH_REDIS_REST_URL` | Optional | Upstash Redis REST endpoint URL | `https://xxxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN`| Optional | Upstash Redis REST access token | `AXxxASQg...` |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical production URL | `https://shreesai.restaurant` |

> [!NOTE]
> If `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` are omitted or invalid, the menu will run in **read-only fallback mode** using `data/menu.ts`. Admin modifications will prompt to configure Redis.

---

## 🗄️ Upstash Redis Setup

You can set up Upstash Redis in under 2 minutes:

### Option A: Via Vercel Integration (Recommended)
1. Deploy your project to [Vercel](https://vercel.com).
2. Go to the project dashboard → **Storage** tab.
3. Click **Connect Database** → Select **Upstash Redis**.
4. Follow the prompt to create a free database. Vercel will automatically populate `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in your environment variables.

### Option B: Via Upstash Console
1. Sign up or log in at [console.upstash.com](https://console.upstash.com).
2. Click **Create Database** (choose region closest to Mumbai / `ap-south-1`).
3. Under the **REST API** section, copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
4. Paste them into your `.env.local` (local) and Vercel project environment variables.

### Data Keys in Redis
- `menu:current`: The live menu data object (Zod-validated).
- `menu:snapshots`: Capped array (max 30) of historical edits with timestamps.
- `admin:login_attempts:<ip>`: Rate limit tracking counter with 15-minute TTL.

---

## 🛠️ Owner & Admin User Guide (`/admin`)

Access the admin panel by visiting `/admin` in your browser.

### 1. Logging In
- Enter your `ADMIN_PASSWORD`.
- Upon successful login, a 7-day secure session cookie is minted.
- Rate limiting locks out IPs after 5 failed attempts for 15 minutes.

### 2. Editing Prices
- Click/tap any price input.
- Enter the new price using your keyboard or phone's numeric keypad.
- Tab away or press **Enter** (blur) — the system automatically saves to Upstash Redis and revalidates the public menu in the background.
- A status badge in the header shows **Saving...** → **Saved**.

### 3. Sold Out Toggle
- Click the toggle switch next to any item to mark it "Not today".
- On the public menu, the item receives a clean strikethrough, muted text, and sold-out styling while keeping the layout intact.

### 4. Adding & Deleting Dishes
- **Add Dish**: Click **+ Add Item** at the bottom of any category panel. Enter English and Gujarati names, set prices, and save.
- **Delete Dish**: Click the trash icon next to any item and confirm the deletion prompt.
- **Sai Special / Featured Toggle**: Click the star (★) button on any dish row. When enabled, the dish is marked as a signature item, displays a gold "Sai Special" badge, and appears on the curated "Popular / Sai Special" shelf at the top of its category group.

### 5. Managing Categories & Category Groups
- Click **Category Settings** (gear icon) on any section:
  - **Group Assignment**: Assign the category to any of the primary category groups (`South Indian`, `Pav Bhaji & Pulav`, `Sandwich & Grill`, `Pizza & Burger`, `Chinese`, `Drinks`).
  - **Rename**: Edit English and Gujarati category titles.
  - **Price Columns**: Select column presets (`single`, `single_plate`, `oil_butter`, `half_full`).
  - **Availability Hours**: Set restricted service windows (e.g., `13:00` to `23:00`).
  - **Notes**: Add or edit section footer notes (e.g., Jain options, packing charges).
  - **Hide Category**: Temporarily hide an entire section from the public menu.
- Reorder categories using the **↑** and **↓** buttons.

#### How to Add a New Category Group
To add a brand new top-level category group (e.g. `Desserts` or `Thali`):
1. Open `lib/groups.ts` and add an entry to `MENU_GROUPS`:
   ```ts
   {
     id: "desserts",
     en: "Desserts & Sweets",
     gu: "મીઠાઈ અને ડેઝર્ટ",
     icon: "cake",
   }
   ```
2. (Optional) In `components/GroupMotifs.tsx`, add an authentic SVG culinary motif in `getGroupMotif("desserts")`.
3. In `/admin`, open **Category Settings** (gear icon) on any section and select your new group from the **Group** dropdown, or set `"group": "desserts"` in `data/menu.ts`. The new group tab will automatically render on the public menu and desktop left rail as soon as it contains active sections.

### 6. Bulk Price Adjustment
- Click **Bulk Price Change** in the top admin bar.
- Choose whether to adjust **All Categories** or a **Specific Category**.
- Choose adjustment type:
  - **Fixed Amount (₹)**: e.g. `+10` or `-5`
  - **Percentage (%)**: e.g. `+5%` (rounded to nearest ₹5 or ₹10)
- Inspect the interactive before/after preview table.
- Click **Apply Bulk Change** to save.

### 7. History & Rollback (`/admin/history`)
- Click **History** in the top bar.
- View up to 30 past revisions with timestamps and dish counts.
- Click **Restore this version** on any snapshot to instantly roll back mistakes.

### 8. Backup & Factory Reset
- **Export JSON**: Download a complete `.json` copy of the current menu.
- **Import JSON**: Upload and restore a previously exported `.json` menu file.
- **Reset to Original Menu**: Re-seeds the menu back to the authentic 1989 opening day menu from `data/menu.ts`.

### 9. QR Code Generator & Table Tent Printing
- Access via the **QR & Print** button in the top bar or the **Menu QR Codes & Table Tents** card on `/admin`.
- **Live QR Generator**:
  - **Master Menu**: Encodes the root menu URL with 1-click PNG (1200px) or vector SVG downloads.
  - **Table Specific (1–20+)**: Select any table; live QR preview updates instantly with `/?t=N` scan URL.
  - **Custom Link**: Generate branded QR codes for WiFi passwords, Google reviews, or Instagram.
- **Print Table Tents Directly**:
  - **Single Table Sheet (4-up)**: Reprint 4 copies of any individual table tent on 1 A4 page.
  - **Batch Print (Tables 1–20)**: One-click print for all 20 tables across 5 A4 sheets with cut and fold guides.
  - **Master QR Sheet (4-up)**: Print 4 general menu tent cards on a single sheet.

---

## 📱 QR Codes & Printable Table Tents

### 1. Generating QR Assets
Run the generator script anytime:
```bash
npm run qr
```
This generates high-resolution SVGs and PNGs in both `qr/` and `public/qr/`:
- `menu-qr.svg` & `menu-qr.png`: Master menu URL (`/`)
- `table-1.png` through `table-20.png`: Table-specific URLs (`/?t=1` through `/?t=20`)

### 2. Printable Table Tent Cards (`/print/qr`)
Visit `/print/qr` in any browser:
- Select **All Tables (1–20)** or **Master Menu**.
- Click **Print Cards (Ctrl+P / Cmd+P)**.
- Formatted specifically for standard **A4 paper** (4 folded A6 table tents per page) with:
  - Restaurant emblem & gold border
  - Table number badge (`ટેબલ N` / `Table N`)
  - Crisp scannable QR code
  - Gujarati tagline & contact numbers
  - Dotted fold and cut guides

---

## ☁️ Deploying to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Shree Sai Restaurant digital menu"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and select the repository.
   - Framework preset: **Next.js**.

3. **Configure Environment Variables**:
   Add the following under **Project Settings → Environment Variables**:
   - `ADMIN_PASSWORD` = `<your-admin-password>`
   - `AUTH_SECRET` = `<your-32-char-random-secret>`
   - `UPSTASH_REDIS_REST_URL` = `<your-upstash-url>`
   - `UPSTASH_REDIS_REST_TOKEN` = `<your-upstash-token>`
   - `NEXT_PUBLIC_SITE_URL` = `https://<your-project>.vercel.app` (or custom domain)

4. **Deploy**:
   - Click **Deploy**.
   - Your digital menu will be live worldwide on Vercel's Edge Network with instantaneous ISR revalidation!

---

## 🏗️ Architecture & Tech Stack

```
├── app/
│   ├── globals.css           # Design tokens (cream, indigo, ribbon red, dotted leaders)
│   ├── layout.tsx            # Fonts (Fraunces, Mukta, Noto Gujarati), Restaurant Schema JSON-LD
│   ├── page.tsx              # Public menu page (Static ISR, 60s revalidation)
│   ├── manifest.ts           # PWA web app manifest
│   ├── admin/
│   │   ├── layout.tsx        # noindex robots header & admin layout
│   │   ├── page.tsx          # Admin dashboard
│   │   ├── history/page.tsx  # Snapshot history & restore UI
│   │   └── login/page.tsx    # Password login screen
│   ├── api/admin/
│   │   ├── login/route.ts    # Timing-safe auth & JWT cookie issuer
│   │   ├── logout/route.ts   # Session revocation
│   │   ├── save/route.ts     # Zod validated store writer + revalidatePath('/')
│   │   ├── history/route.ts  # Snapshot reader
│   │   ├── restore/route.ts  # Snapshot rollback
│   │   ├── export/route.ts   # JSON backup exporter
│   │   ├── import/route.ts   # JSON backup importer
│   │   └── reset/route.ts    # Original menu factory reset
│   └── print/qr/page.tsx     # Printable A6 table-tent cards (4 per A4)
├── components/
│   ├── Header.tsx            # Heritage SVG emblem, wordmark, table badge
│   ├── Footer.tsx            # Since 1989, tap-to-call, Google Maps link
│   ├── MenuClientContainer.tsx # Sticky 2-row navigation (search, toggles, category chips) & group views
│   ├── GroupMotifs.tsx       # Hand-drawn culinary SVG motifs (dosa, pav bhaji, sandwich, pizza, noodles, drink)
│   ├── LanguageToggle.tsx    # English / ગુજરાતી / Both tri-state switcher
│   ├── ThemeToggle.tsx       # Brand-aligned night mode switcher
│   ├── SearchBox.tsx         # Real-time search with match counters
│   ├── Ribbon.tsx            # Polygon clip-path ribbon tags
│   ├── MenuItem.tsx          # Aligned prices, dotted leaders, sold-out styling
│   ├── MenuSection.tsx       # Section containers with time-based availability badges
│   ├── PWARegister.tsx       # Progressive Web App offline worker registration
│   └── admin/                # Admin editing modals, QR generator modal, bulk price dialog, item rows
├── types/
│   └── menu.ts               # Canonical TypeScript definitions (Price, Item, Section, MenuData)
├── data/
│   └── menu.ts               # Complete seed & fallback menu (17 sections, 143 items)
├── lib/
│   ├── auth.ts               # TimingSafeEqual, jose JWT sign/verify, Redis rate limiter
│   ├── groups.ts             # Category group mapping and navigation constants
│   ├── schema.ts             # Strict Zod schemas for MenuData, Sections, and Items
│   ├── store.ts              # Upstash Redis get/save/snapshot with local fallback
│   └── time.ts               # Asia/Kolkata timezone parser & availability check
└── scripts/
    ├── check-menu.ts         # Menu data integrity and count verification
    └── generate-qr.ts        # QR code generator & decoder verification
```

---

## 📜 License & Credits

- **Restaurant**: Shree Sai Restaurant, Salabatpura, Surat (Gujarat, India).
- **Heritage**: Serving South Indian, Pav Bhaji, and fast food since 1989.
- Built with pride for pure vegetarian authentic street food culture.
