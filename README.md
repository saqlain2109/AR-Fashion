# AR Fashion House — Complete E-Commerce Store & Separate Admin Panel

A full-stack, enterprise-grade e-commerce application featuring two completely isolated interfaces: a public customer-facing storefront and a separate, secure, feature-rich admin dashboard with complete product, inventory, order, and content management.

---

## 🔑 Default Administrator Credentials

To access the separate admin panel:
- **Route:** `/admin/login`
- **Email:** `admin@arfashion.com`
- **Password:** `Admin@12345`

*Public registration for admin roles is strictly disabled for security.*

---

## 🌟 Key Architecture & Capabilities

### 1. Customer-Facing Storefront (`/`)
- **Public Product Catalogue:** Browse handcrafted traditional & contemporary clothing (Panjabis, Sarees, Kurtis, Casual Shirts).
- **Advanced Filtering & Search:** Filter by Category, Size (XS, S, M, L, XL, XXL, etc.), Colour, Price Range, and In-Stock availability.
- **Interactive Product Details:**
  - Multi-image gallery with high-resolution photo previews.
  - Independent Size & Colour selection with real-time stock indicator per combination.
  - Variant-specific pricing support.
  - Automatic out-of-stock disabling.
- **Cart & Bag Management:** Real-time cart drawer with quantity stepper and free shipping progress bar.
- **WhatsApp Checkout:**
  - Validates stock on the backend before order creation.
  - Decrements database inventory atomically.
  - Generates a unique order number (`AR-YYYYMMDD-XXXX`).
  - Pre-formats a structured WhatsApp message with customer details, itemized breakdown, and financial totals.
  - Direct 1-click launch to WhatsApp sales representative.
- **Store Policies:** Dynamic, database-driven pages for Privacy Policy, Shipping Policy, Return Policy, and Terms & Conditions.

---

### 2. Separate Admin Panel (`/admin/login`, `/admin/dashboard`)
- **Protected Layout:** Fixed collapsible left sidebar navigation (`#0F172A` / `#0B132B`) with Emerald Green active pill indicators and collapsible accordion groups.
- **Real-Time Operational Dashboard (`/admin/dashboard`):**
  - Live statistics from actual SQLite database: Total Products, Active (Published) Products, Out-of-Stock Products, Total Categories, Pending Orders, Confirmed Orders, and Total Revenue.
  - Recent incoming WhatsApp orders table with live status badges.
- **Universal Data Tables Engine (Mandatory Actions Mega-Menu):**
  Implemented across all lists (Products, Categories, Inventory, Orders):
  1. **Columns (x/y):** Checkbox popover to toggle visibility and reorder columns.
  2. **Filter:** Advanced multi-column filtering modal.
  3. **Freeze Header Row:** Sticky table header during vertical scroll.
  4. **Freeze Key Columns:** Sticky first column and dedicated Actions column during horizontal scroll.
  5. **Report / Views:** Save custom column/filter presets and switch between views.
  6. **Download / Export Filtered:** 1-click CSV export of currently filtered data.
  7. **Auto-Wrap Long Data:** Toggle between clean text truncation and multi-line wrapping.
  8. **Font Size / Density Selector:** 7 selectable row densities (`Extra Small`, `Compact`, `Normal`, `Medium`, `Comfortable`, `Large`, `Extra Large`).
  9. **Reset All (Columns & Filters):** Restores defaults in one click.
  - **Mandatory Row Actions:** 👁️ View details, ✏️ Edit record, 🗑️ Safety confirmation modal for deletion.
  - **Chronological Sorting:** All dates/months sorted chronologically by timestamp, never alphabetically.
- **Add / Edit Product Unified Form (`/admin/products/new`, `/admin/products/[id]/edit`):**
  - Single reusable component for creating and editing.
  - Direct computer/phone photograph upload via drag-and-drop or file picker.
  - Select primary thumbnail, reorder images, and remove images.
  - Persistent disk storage in `/public/uploads`.
  - Dynamic **Size × Colour Matrix Generator** with independent stock and optional price override.
  - Live Customer PDP Preview modal before saving.
  - Save as Draft vs. Publish Product (Drafts remain hidden from storefront).
- **Category Masters (`/admin/categories`):**
  - Create, edit, and reorder apparel categories with photograph upload.
  - Active toggle to show or hide on the storefront.
  - Displays product counts per category.
- **Inventory & Stock Management (`/admin/inventory`):**
  - View stock by product, size, and colour.
  - Quick inline stock quantity updater.
  - Low-stock (`<= 5`) and Out-of-stock (`= 0`) filter pills.
- **Order Management (`/admin/orders`):**
  - Inspect full customer details, ordered sizes, colours, quantities, and addresses.
  - Status management: `Pending WhatsApp Confirmation`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`.
  - Internal staff notes editor.
  - Printable invoice / order summary.
  - Direct WhatsApp customer chat link.
- **Store Settings (`/admin/settings`):**
  - Business name, logo upload, primary & secondary WhatsApp numbers, default recipient routing, business email, shipping charges, free shipping threshold, currency, store announcement bar, and social media links.
- **Website Content Management (`/admin/content`):**
  - Hero banner photo upload, headings, descriptions, CTA buttons and destinations, and brand story.
- **Policy Management (`/admin/policies`):**
  - Editable policies for Privacy, Shipping, Return & Refund, and Terms & Conditions.

---

## 🚀 Running the Application

### 1. Development Mode:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the storefront or [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin portal.

### 2. Production Mode:
```bash
npm run build
npm run start
```

### 3. Database Management:
- Reset/Push Schema: `npm run db:push`
- Re-seed default database: `npm run db:seed`
