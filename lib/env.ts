import "server-only";

const REQUIRED_ENVIRONMENT_KEYS = [
  "BUSINESS_EMAIL",
  "EMAIL_FROM",
  "BRAND_NAME",
  "GOOGLE_SHEET_ID",
  "GOOGLE_SHEET_TAB_NAME",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
] as const;

export class ConfigurationError extends Error {
  missingKeys: string[];

  constructor(missingKeys: string[]) {
    super(`Missing required server configuration: ${missingKeys.join(", ")}`);
    this.name = "ConfigurationError";
    this.missingKeys = missingKeys;
  }
}

export function assertServerConfiguration() {
  const missingKeys = REQUIRED_ENVIRONMENT_KEYS.filter(
    (key) => !process.env[key]?.trim(),
  );
  if (missingKeys.length > 0) {
    throw new ConfigurationError([...missingKeys]);
  }
}

export function serverEnvironment() {
  assertServerConfiguration();
  return {
    businessEmail: process.env.BUSINESS_EMAIL!,
    emailFrom: process.env.EMAIL_FROM!,
    brandName: process.env.BRAND_NAME!,
    googleSheetId: process.env.GOOGLE_SHEET_ID!,
    googleSheetTabName: process.env.GOOGLE_SHEET_TAB_NAME!,
    googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    smtpHost: process.env.SMTP_HOST!,
    smtpPort: Number(process.env.SMTP_PORT!),
    smtpUser: process.env.SMTP_USER!,
    smtpPass: process.env.SMTP_PASS!,
  };
}
