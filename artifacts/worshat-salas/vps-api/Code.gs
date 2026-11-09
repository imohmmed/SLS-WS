const SPREADSHEET_ID = "1kqwWDbm0TwagkmDTZLUy5xZg86PRDmiWg6-xJ9NpFB4";
const SHEET_NAME = "التسجيلات";

function doGet() {
  return jsonOutput_({ status: "ok" });
}

function authorizeSheetAccess() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getName();
}

function doPost(event) {
  try {
    const payload = JSON.parse(event?.postData?.contents || "{}");
    const expectedSecret = PropertiesService.getScriptProperties().getProperty(
      "WORKSHOP_SHARED_SECRET",
    );

    if (
      !expectedSecret ||
      !constantTimeEquals_(String(payload.secret || ""), expectedSecret)
    ) {
      return jsonOutput_({ success: false, error: "UNAUTHORIZED" });
    }

    const registration = validateRegistration_(payload.registration);
    if (!registration) {
      return jsonOutput_({ success: false, error: "INVALID_REGISTRATION" });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonOutput_({ success: false, error: "SHEET_NOT_FOUND" });
    }

    const row = [
      Utilities.formatDate(
        new Date(),
        "Asia/Baghdad",
        "yyyy-MM-dd HH:mm:ss",
      ),
      safeCell_(registration.fullName),
      safeCell_(registration.phone),
      safeCell_(registration.email),
      safeCell_(registration.contentField),
      safeCell_(registration.experience),
      safeCell_(registration.goal),
      safeCell_(registration.notes),
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }

    return jsonOutput_({ success: true });
  } catch (error) {
    console.error("Workshop registration could not be saved.");
    return jsonOutput_({ success: false, error: "SAVE_FAILED" });
  }
}

function validateRegistration_(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (typeof value.fullName !== "string" || typeof value.phone !== "string") {
    return null;
  }

  const registration = {
    fullName: value.fullName.trim(),
    phone: value.phone.trim(),
    email: "",
    contentField: "",
    experience: "",
    goal: "",
    notes: "",
  };

  if (registration.fullName.length < 2 || registration.fullName.length > 120) {
    return null;
  }
  if (registration.phone.length < 7 || registration.phone.length > 30) {
    return null;
  }

  const limits = {
    email: 254,
    contentField: 120,
    experience: 120,
    goal: 500,
    notes: 1000,
  };

  for (const [key, maxLength] of Object.entries(limits)) {
    const field = value[key];
    if (field === undefined) continue;
    if (typeof field !== "string" || field.length > maxLength) return null;
    registration[key] = field.trim();
  }

  if (
    registration.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email)
  ) {
    return null;
  }

  return registration;
}

function safeCell_(value) {
  const text = String(value || "");
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function constantTimeEquals_(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function jsonOutput_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
