# Manaslu Ukulele COD Sales Funnel

A production-oriented Cash On Delivery funnel built with Next.js, TypeScript and Tailwind CSS. It includes a conversion-focused landing page, checkout, thank-you page, a secure order API, Google Sheets storage, and two responsive HTML email notifications.

## Order flow

1. The customer chooses quantity and delivery area on the landing page.
2. Product name, quantity, unit price, delivery fee and total are passed to `/checkout`.
3. The checkout posts customer data to `POST /api/order`.
4. The API validates every field and recalculates all pricing from server-owned constants.
5. A deterministic unique order ID is generated from the browser's one-time order reference.
6. The order is appended to Google Sheets. A retry with the same reference will not append a second row.
7. A business notification and customer confirmation are sent through Gmail-compatible SMTP.
8. Only after all required actions succeed is the customer sent to `/thank-you`.

If the spreadsheet succeeds but an email fails, the API returns an error and keeps the same order reference for a safe retry. The retry detects the existing sheet row and skips a duplicate append. Email messages use stable Message-IDs, although final email deduplication still depends on the SMTP provider.

## Local setup

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Never commit `.env.local`. It is ignored by Git.

## Environment variables

Copy `.env.example` to `.env.local` and add:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, such as `https://shop.example.com` |
| `FRONTEND_URL` | Allowed browser origin; normally the same public URL |
| `BUSINESS_EMAIL` | Inbox that receives new-order notifications |
| `EMAIL_FROM` | Address shown as the sender and customer reply-to |
| `BRAND_NAME` | Brand used in both email templates |
| `GOOGLE_SHEET_ID` | ID from the Google Sheet URL |
| `GOOGLE_SHEET_TAB_NAME` | Exact tab name, such as `Orders` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service-account email from Google Cloud |
| `GOOGLE_PRIVATE_KEY` | Service-account private key, including escaped `\n` line breaks |
| `SMTP_HOST` | `smtp.gmail.com` for Gmail |
| `SMTP_PORT` | `465` for SSL or `587` for STARTTLS |
| `SMTP_USER` | Gmail/Google Workspace SMTP username |
| `SMTP_PASS` | Google App Password, not the normal account password |
| `EMAIL_SERVICE_API_KEY` | Reserved for a future API email provider; not used by SMTP |

On Vercel, paste the full Google private key value into the environment variable. The server converts escaped `\n` characters into real line breaks.

## Google Spreadsheet setup

### 1. Create the sheet

Create a Google Spreadsheet and rename the destination tab, for example, to `Orders`. The API creates the tab and header row automatically when needed. If a header row already exists, it must match these columns exactly from A through O:

1. Order ID
2. Date & Time
3. Customer Name
4. Phone Number
5. Email Address
6. Exact Location
7. Product Name
8. Quantity
9. Price Per Piece
10. Delivery Area
11. Delivery Fee
12. Total Price
13. Payment Method
14. Order Status
15. Notes

### 2. Automatic presentation

The API applies a branded header, freezes the first row, enables filters, sizes columns and rows, wraps long text, formats currency, and highlights the order-status column.

### 3. Order-status dropdown

The API adds a dropdown to column N with these values:

- New Order
- Order Confirmed
- Order Ongoing
- Delivered
- Cancelled

The API writes `New Order` by default. Payment Method is always `Cash On Delivery`, and Notes starts empty.

### 4. Get the Sheet ID

In this URL:

```text
https://docs.google.com/spreadsheets/d/1AbCdEf...XYZ/edit
```

the Sheet ID is the part between `/d/` and `/edit`.

### 5. Create Google credentials

1. Open Google Cloud Console and select or create a project.
2. Enable **Google Sheets API**.
3. Open **IAM & Admin → Service Accounts** and create a service account.
4. Create a JSON key for it.
5. Copy `client_email` into `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
6. Copy `private_key` into `GOOGLE_PRIVATE_KEY`.
7. Share the spreadsheet with the service-account email as **Editor**.

The API reads the configured tab, verifies the A:O headers, checks for an existing Order ID, and appends the order with the Sheets API. Existing A:M sheets from the earlier schema are migrated automatically. Cells beginning with spreadsheet formula characters are neutralized before insertion.

## Gmail SMTP setup

1. Turn on two-step verification for the Gmail/Google Workspace account.
2. Create a Google **App Password** for Mail.
3. Set `SMTP_HOST=smtp.gmail.com`.
4. Set `SMTP_PORT=465`.
5. Put the Gmail address in `SMTP_USER` and the 16-character App Password in `SMTP_PASS`.
6. Set both `BUSINESS_EMAIL` and `EMAIL_FROM` to the desired addresses. Gmail may require `EMAIL_FROM` to match the authenticated account or a configured alias.

Two HTML emails are sent: a detailed ecommerce-style internal order notification and a mobile-friendly customer receipt. SMTP credentials never reach the browser.

## Testing order submission

Run the automated checks first:

```bash
npm test
npm run typecheck
npm run build
```

Then perform one end-to-end test with real test credentials:

1. Use a separate test sheet tab and your own customer email.
2. Start the app with `npm run dev`.
3. Choose quantity and delivery area on the landing page.
4. Submit valid checkout details.
5. Confirm exactly one new row appears in the sheet.
6. Confirm the business inbox receives the order notification.
7. Confirm the customer inbox receives the confirmation.
8. Confirm the browser redirects to `/thank-you` with the same Order ID and correct total.
9. Temporarily use an invalid SMTP password and confirm the checkout displays an error instead of redirecting.
10. Restore SMTP credentials and retry; confirm the sheet does not receive a duplicate row.

Without Google and SMTP credentials, the UI remains testable but the API intentionally returns a configuration error instead of pretending the order succeeded.

## Deploying to Vercel

1. Push this project to a private Git repository.
2. Import the repository in Vercel as a Next.js project.
3. Add every variable from `.env.example` under **Project Settings → Environment Variables** for Production and Preview as needed.
4. Set `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL` to the deployed production origin, with no path.
5. Deploy, then run the end-to-end checklist above.
6. After the first deployment, update the two URL variables if Vercel assigned a different domain and redeploy.

The API uses the Node.js runtime because Nodemailer and Google authentication require server-side Node APIs.

## Editing product content

Prices, delivery fees, product name, images and checkout limits are centralized in `lib/product.ts`. Landing-page content is in `components/landing-page.tsx`; email layouts are in `lib/email.ts`.

The current testimonial portraits are AI-generated fictional people and the copy is explicitly labelled as illustrative sample content in the UI. Replace every sample profile and quote with verified customer permission before a public launch.

The supplied product photographs visibly contain **KaKa** branding while the requested product and copy say **Manaslu**. They have been preserved faithfully and not digitally relabelled. Replace them with photographs of the actual Manaslu Danfe product before public launch to avoid a brand/product mismatch.

## Image assets

The three supplied JPEG product images were converted to optimized, display-sized PNG files in `public/images`. The three fictional testimonial portraits were generated with OpenAI ImageGen using photorealistic-natural prompts and then resized for web delivery.
