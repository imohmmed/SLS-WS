const SPREADSHEET_ID = "1kqwWDbm0TwagkmDTZLUy5xZg86PRDmiWg6-xJ9NpFB4";
const SHEET_NAME = "التسجيلات";
const PLAN_LABELS = {
  full: "الورشة كاملة، دفع كامل، ١٢٥٬٠٠٠ دينار",
  installments:
    "الورشة كاملة على دفعتين: ٧٥٬٠٠٠ للأيام الثلاثة الأولى و٥٠٬٠٠٠ قبل اليوم الرابع",
  "single-day": "يوم واحد، ٢٥٬٠٠٠ دينار",
};

function doGet() {
  return jsonOutput_({ status: "ok" });
}

function authorizeSheetAccess() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('The "التسجيلات" tab was not found.');
  sheet.getRange("I1").getDisplayValue();
  return "Google Sheets access authorized.";
}

function doPost(event) {
  let lock;
  let lockAcquired = false;

  try {
    const rawBody = event && event.postData && event.postData.contents;
    const payload = JSON.parse(rawBody || "{}");
    const expectedSecret = PropertiesService.getScriptProperties().getProperty(
      "WORKSHOP_SHARED_SECRET",
    );

    if (!expectedSecret || !constantTimeEquals_(expectedSecret, payload.secret)) {
      return jsonOutput_({ success: false, error: "UNAUTHORIZED" });
    }

    const registration = normalizeRegistration_(payload.registration);
    if (!registration) {
      return jsonOutput_({ success: false, error: "INVALID_REGISTRATION" });
    }

    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    lockAcquired = true;

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonOutput_({ success: false, error: "SHEET_NOT_FOUND" });
    }

    ensureSubscriptionHeader_(sheet);
    const timestamp = Utilities.formatDate(
      new Date(),
      "Asia/Baghdad",
      "yyyy-MM-dd HH:mm:ss",
    );

    sheet.appendRow([
      timestamp,
      safeCell_(registration.fullName),
      safeCell_(registration.phone),
      safeCell_(registration.email),
      safeCell_(registration.contentField),
      safeCell_(registration.experience),
      safeCell_(registration.goal),
      safeCell_(registration.notes),
      safeCell_(registration.subscriptionPlan),
    ]);
    SpreadsheetApp.flush();

    return jsonOutput_({ success: true });
  } catch (error) {
    console.error(
      "Registration write failed:",
      error && error.name ? error.name : "Error",
    );
    return jsonOutput_({ success: false, error: "SAVE_FAILED" });
  } finally {
    if (lockAcquired) lock.releaseLock();
  }
}

function normalizeRegistration_(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const allowedKeys = new Set([
    "fullName",
    "phone",
    "email",
    "subscriptionPlan",
    "contentField",
    "experience",
    "goal",
    "notes",
  ]);
  if (Object.keys(input).some((key) => !allowedKeys.has(key))) return null;

  const limits = {
    fullName: 120,
    phone: 30,
    email: 254,
    contentField: 120,
    experience: 120,
    goal: 500,
    notes: 1000,
  };
  const values = {};
  for (const key in limits) {
    const value = input[key];
    if (typeof value !== "string" || value.length > limits[key]) return null;
    values[key] = value.trim();
    if (!values[key]) return null;
  }

  if (values.fullName.length < 2 || values.phone.length < 7) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return null;

  const planFromField =
    typeof input.subscriptionPlan === "string" &&
    Object.prototype.hasOwnProperty.call(PLAN_LABELS, input.subscriptionPlan)
      ? input.subscriptionPlan
      : null;

  const parsedNotes = parsePlanFromNotes_(values.notes);
  if (input.subscriptionPlan && !planFromField) return null;
  if (
    planFromField &&
    parsedNotes &&
    planFromField !== parsedNotes.planKey
  ) {
    return null;
  }

  const planKey = planFromField || (parsedNotes && parsedNotes.planKey);
  const notes = parsedNotes ? parsedNotes.notes : values.notes;
  if (!planKey || !notes || notes.length > 850) return null;

  return {
    fullName: values.fullName,
    phone: values.phone,
    email: values.email,
    contentField: values.contentField,
    experience: values.experience,
    goal: values.goal,
    notes,
    subscriptionPlan: PLAN_LABELS[planKey],
  };
}

function parsePlanFromNotes_(notes) {
  const match = notes.match(
    /^خيار الاشتراك:\s*([^\r\n]+)\r?\n\r?\nملاحظة:\s*([\s\S]*)$/,
  );
  if (!match) return null;

  const label = match[1].trim();
  const planKey = Object.keys(PLAN_LABELS).find(
    (key) => PLAN_LABELS[key] === label,
  );
  if (!planKey) return null;

  return { planKey, notes: match[2].trim() };
}

function ensureSubscriptionHeader_(sheet) {
  const headerCell = sheet.getRange("I1");
  if (!String(headerCell.getValue() || "").trim()) {
    headerCell.setValue("نوع الاشتراك");
  }
}

function safeCell_(value) {
  const text = String(value).trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function constantTimeEquals_(left, right) {
  const first = String(left || "");
  const second = String(right || "");
  const length = Math.max(first.length, second.length);
  let difference = first.length ^ second.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (first.charCodeAt(index) || 0) ^ (second.charCodeAt(index) || 0);
  }

  return difference === 0;
}

function jsonOutput_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}