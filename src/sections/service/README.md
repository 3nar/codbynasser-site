# صفحات الخدمات (`/services/accounts/` · `/services/ai/` · `/services/software/`)

صفحة واحدة `src/pages/services/[service].astro` تبني صفحة لكل خدمة في `src/content/services/<اللغة>/`. نصوص الخدمة كلها في ملفها هناك؛ شاشات الموبايل في `src/i18n/ui/ar/screens.json`. الموبايل الذي يتبع القراءة يحرّكه `FixPhone/fix-phone.ts`.

| القسم                                  | ما فيه                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| `ServiceHero/` (`ServiceSwitch.astro`) | المشكلة وحدها في الهالة، بارتفاع الشاشة، والمبدّل بين الخدمات                                |
| `Problems/` (`Problem.astro`)          | المشكلات واحدة بعد أخرى: السؤال، السبب، الحل، «يشمل»، و«اطلب هذا الحل»؛ ثم سطر الهدف والتالي |
| `FixPhone/`                            | الموبايل الثابت الذي يعرض حل المشكلة المقروءة، وخطوط التقدم، واسم الحل                       |
| `FixPhone/screens/`                    | `FixScreen` يختار شاشة الحل: `AccountsScreens` (3) · `AiScreens` (4) · `SoftwareScreens` (3) |
| (`components/sections/ClosingCta`)     | الخاتمة، وزر الطلب يحمل الخدمة الحالية                                                       |
