# ورشة سلس

موقع عربي تعريفي وتفاعلي للتسجيل في ورشة صناعة المحتوى «سلس».

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/worshat-salas/` — صفحة الورشة وتجربة التسجيل.
- `artifacts/api-server/src/routes/registrations.ts` — استقبال التسجيلات وإرسالها إلى Google Sheets.
- `lib/api-spec/openapi.yaml` — عقد واجهة التسجيل ومصدر توليد مخططات التحقق وعميل الواجهة.
- `artifacts/worshat-salas/src/assets/salas-logo.png` — شعار الورشة المرفق.

## Architecture decisions

- تحفظ التسجيلات مباشرة في ملف Google Sheets «ورشة سلس»؛ لا تُخزّن نسخة ثانية في قاعدة بيانات التطبيق.
- بيانات الورشة والأسئلة الحالية أولية وتحتاج مراجعة قبل النشر العام.

## Product

- صفحة عربية بالكامل تشرح ورشة صناعة المحتوى وتتيح إرسال تسجيل مباشر.

## User preferences

- واجهة بسيطة ومرتبة وجذابة بحركات ناعمة، مع ألوان مستوحاة من الشعار.
- كل النصوص الظاهرة للمستخدم بالعربية فقط.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
