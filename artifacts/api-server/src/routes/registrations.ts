import { Router, type IRouter } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";
import {
  CreateWorkshopRegistrationBody,
  CreateWorkshopRegistrationResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const connectors = new ReplitConnectors();
const spreadsheetId = "1kqwWDbm0TwagkmDTZLUy5xZg86PRDmiWg6-xJ9NpFB4";
const registrationRange = encodeURIComponent("'التسجيلات'!A:H");

router.post("/registrations", async (req, res): Promise<void> => {
  const parsed = CreateWorkshopRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.issues }, "Invalid workshop registration");
    res.status(400).json({ error: "يرجى التأكد من المعلومات المدخلة." });
    return;
  }

  const { fullName, phone, email, contentField, experience, goal, notes } =
    parsed.data;
  if (
    [fullName, phone, email, contentField, experience, goal, notes].some(
      (value) => !value.trim(),
    )
  ) {
    res.status(400).json({ error: "يرجى تعبئة جميع الحقول." });
    return;
  }

  try {
    const response = await connectors.proxy(
      "google-sheet",
      `/v4/spreadsheets/${spreadsheetId}/values/${registrationRange}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        body: {
          values: [
            [
              new Intl.DateTimeFormat("ar-IQ", {
                dateStyle: "short",
                timeStyle: "short",
                timeZone: "Asia/Baghdad",
              }).format(new Date()),
              fullName.trim(),
              phone.trim(),
              email.trim(),
              contentField.trim(),
              experience.trim(),
              goal.trim(),
              notes.trim(),
            ],
          ],
        },
      },
    );

    if (!response.ok) {
      req.log.error(
        { providerStatus: response.status },
        "Google Sheets registration append failed",
      );
      res.status(502).json({
        error: "تعذّر إرسال التسجيل الآن. حاول مرة ثانية بعد قليل.",
      });
      return;
    }

    res.status(201).json(
      CreateWorkshopRegistrationResponse.parse({
        success: true,
        message: "وصل تسجيلك بنجاح، ننتظرك بورشة سلس.",
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Google Sheets registration request failed");
    res.status(502).json({
      error: "تعذّر إرسال التسجيل الآن. حاول مرة ثانية بعد قليل.",
    });
  }
});

export default router;
