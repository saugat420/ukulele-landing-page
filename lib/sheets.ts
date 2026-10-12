import "server-only";
import { google, sheets_v4 } from "googleapis";
import { serverEnvironment } from "@/lib/env";
import type { OrderRecord } from "@/lib/order";
import { DELIVERY_OPTIONS } from "@/lib/product";

export const SHEET_HEADERS = [
  "Order ID",
  "Date & Time",
  "Customer Name",
  "Phone Number",
  "Email Address",
  "Exact Location",
  "Product Name",
  "Quantity",
  "Price Per Piece",
  "Delivery Area",
  "Delivery Fee",
  "Total Price",
  "Payment Method",
  "Order Status",
  "Notes",
] as const;

const LEGACY_SHEET_HEADERS = [
  "Order ID",
  "Date & Time",
  "Customer Name",
  "Phone Number",
  "Email Address",
  "Exact Location",
  "Product Name",
  "Quantity",
  "Price Per Piece",
  "Total Price",
  "Payment Method",
  "Order Status",
  "Notes",
] as const;

const LAST_COLUMN = "O";
const BODY_ROW_LIMIT = 1000;

type SheetsContext = {
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
  tabName: string;
};

function safeSheetCell(value: string): string {
  return /^[=+@]/.test(value) || /^-(?!\d)/.test(value) ? `'${value}` : value;
}

function quotedTabName(tabName: string): string {
  return `'${tabName.replaceAll("'", "''")}'`;
}

async function sheetsClient(): Promise<SheetsContext> {
  const env = serverEnvironment();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.googleServiceAccountEmail,
      private_key: env.googlePrivateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return {
    sheets: google.sheets({ version: "v4", auth }),
    spreadsheetId: env.googleSheetId,
    tabName: env.googleSheetTabName,
  };
}

function headersMatch(current: unknown[], expected: readonly string[]): boolean {
  return (
    current.length >= expected.length &&
    expected.every((header, index) => current[index] === header)
  );
}

async function getOrCreateTab(context: SheetsContext) {
  const { sheets, spreadsheetId, tabName } = context;
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties",
  });
  const existing = spreadsheet.data.sheets?.find(
    (sheet) => sheet.properties?.title === tabName,
  )?.properties;
  if (existing?.sheetId !== undefined) return existing;

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tabName } } }],
    },
  });
  const created = response.data.replies?.[0]?.addSheet?.properties;
  if (created?.sheetId === undefined) {
    throw new Error("Could not create the Google Sheet orders tab.");
  }
  return created;
}

function headerFormatRequests(sheetId: number): sheets_v4.Schema$Request[] {
  const widths = [160, 170, 170, 140, 220, 300, 260, 80, 125, 180, 115, 125, 160, 125, 230];
  const requests: sheets_v4.Schema$Request[] = [
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: { frozenRowCount: 1 },
          tabColorStyle: { rgbColor: { red: 0.875, green: 0.941, blue: 0.369 } },
        },
        fields: "gridProperties.frozenRowCount,tabColorStyle",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: SHEET_HEADERS.length },
        cell: {
          userEnteredFormat: {
            backgroundColorStyle: { rgbColor: { red: 0.086, green: 0.235, blue: 0.2 } },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            textFormat: {
              foregroundColorStyle: { rgbColor: { red: 1, green: 1, blue: 1 } },
              bold: true,
              fontFamily: "Arial",
              fontSize: 10,
            },
            borders: {
              bottom: {
                style: "SOLID_THICK",
                colorStyle: { rgbColor: { red: 0.875, green: 0.941, blue: 0.369 } },
              },
            },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: BODY_ROW_LIMIT, startColumnIndex: 0, endColumnIndex: SHEET_HEADERS.length },
        cell: {
          userEnteredFormat: {
            backgroundColorStyle: { rgbColor: { red: 0.992, green: 0.984, blue: 0.957 } },
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            textFormat: {
              foregroundColorStyle: { rgbColor: { red: 0.09, green: 0.082, blue: 0.063 } },
              fontFamily: "Arial",
              fontSize: 10,
            },
            borders: {
              bottom: {
                style: "SOLID",
                colorStyle: { rgbColor: { red: 0.88, green: 0.85, blue: 0.79 } },
              },
            },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: BODY_ROW_LIMIT, startColumnIndex: 0, endColumnIndex: 1 },
        cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColorStyle: { rgbColor: { red: 0.078, green: 0.31, blue: 0.255 } } } } },
        fields: "userEnteredFormat.textFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: BODY_ROW_LIMIT, startColumnIndex: 7, endColumnIndex: 8 },
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER", numberFormat: { type: "NUMBER", pattern: "0" } } },
        fields: "userEnteredFormat(horizontalAlignment,numberFormat)",
      },
    },
    ...[8, 10, 11].map((columnIndex) => ({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: BODY_ROW_LIMIT, startColumnIndex: columnIndex, endColumnIndex: columnIndex + 1 },
        cell: { userEnteredFormat: { horizontalAlignment: "RIGHT", numberFormat: { type: "NUMBER", pattern: '"Rs" #,##0' } } },
        fields: "userEnteredFormat(horizontalAlignment,numberFormat)",
      },
    })),
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: BODY_ROW_LIMIT, startColumnIndex: 13, endColumnIndex: 14 },
        cell: {
          userEnteredFormat: {
            backgroundColorStyle: { rgbColor: { red: 0.91, green: 0.96, blue: 0.93 } },
            horizontalAlignment: "CENTER",
            textFormat: { bold: true, foregroundColorStyle: { rgbColor: { red: 0.08, green: 0.32, blue: 0.25 } } },
          },
        },
        fields: "userEnteredFormat(backgroundColorStyle,horizontalAlignment,textFormat)",
      },
    },
    {
      setDataValidation: {
        range: { sheetId, startRowIndex: 1, endRowIndex: BODY_ROW_LIMIT, startColumnIndex: 13, endColumnIndex: 14 },
        rule: {
          condition: {
            type: "ONE_OF_LIST",
            values: ["New Order", "Order Confirmed", "Order Ongoing", "Delivered", "Cancelled"].map(
              (userEnteredValue) => ({ userEnteredValue }),
            ),
          },
          strict: true,
          showCustomUi: true,
        },
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 44 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 1, endIndex: BODY_ROW_LIMIT },
        properties: { pixelSize: 42 },
        fields: "pixelSize",
      },
    },
    {
      setBasicFilter: {
        filter: { range: { sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: SHEET_HEADERS.length } },
      },
    },
  ];

  widths.forEach((pixelSize, columnIndex) => {
    requests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: columnIndex, endIndex: columnIndex + 1 },
        properties: { pixelSize },
        fields: "pixelSize",
      },
    });
  });
  return requests;
}

async function ensureSheetLayout(): Promise<SheetsContext> {
  const context = await sheetsClient();
  const { sheets, spreadsheetId, tabName } = context;
  const tab = await getOrCreateTab(context);
  const numericSheetId = tab.sheetId!;
  const range = `${quotedTabName(tabName)}!A1:${LAST_COLUMN}1`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  const currentHeaders = response.data.values?.[0] ?? [];

  if (currentHeaders.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values: [[...SHEET_HEADERS]] },
    });
  } else if (headersMatch(currentHeaders, LEGACY_SHEET_HEADERS)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          insertDimension: {
            range: { sheetId: numericSheetId, dimension: "COLUMNS", startIndex: 9, endIndex: 11 },
            inheritFromBefore: true,
          },
        }],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values: [[...SHEET_HEADERS]] },
    });
  } else if (!headersMatch(currentHeaders, SHEET_HEADERS)) {
    throw new Error(
      "Google Sheet headers do not match the required A:O column structure.",
    );
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: headerFormatRequests(numericSheetId) },
  });
  return context;
}

async function orderAlreadyExists(orderId: string): Promise<boolean> {
  const { sheets, spreadsheetId, tabName } = await sheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quotedTabName(tabName)}!A2:A`,
  });
  return (response.data.values ?? []).some((row) => row[0] === orderId);
}

export async function appendOrderToSheet(
  order: OrderRecord,
): Promise<"appended" | "existing"> {
  const context = await ensureSheetLayout();
  if (await orderAlreadyExists(order.orderId)) {
    return "existing";
  }

  const { sheets, spreadsheetId, tabName } = context;
  const deliveryArea = DELIVERY_OPTIONS.find(
    (option) => option.value === order.deliveryArea,
  )?.label ?? order.deliveryArea;
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${quotedTabName(tabName)}!A:${LAST_COLUMN}`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          order.orderId,
          order.dateTime,
          safeSheetCell(order.fullName),
          safeSheetCell(order.phone),
          safeSheetCell(order.email),
          safeSheetCell(order.exactLocation),
          order.productName,
          order.quantity,
          order.pricePerPiece,
          deliveryArea,
          order.deliveryFee,
          order.totalPrice,
          order.paymentMethod,
          order.orderStatus,
          order.notes,
        ],
      ],
    },
  });
  return "appended";
}
