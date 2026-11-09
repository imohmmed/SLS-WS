import { type FormEvent, type ReactNode } from 'react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateWorkshopRegistration } from '@workspace/api-client-react';
import { ArrowDown, ArrowLeft, ArrowUpLeft, Check, CircleDot, Feather, Instagram, Layers3, MessageCircle, MoveUpLeft, Sparkles } from 'lucide-react';
import salasLogo from '@/assets/salas-logo.png';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const registration = useCreateWorkshopRegistration();
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    contentField: '',
    experience: '',
    goal: '',
    notes: '',
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage('');
    setSubmitted(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    registration.mutate(
      {
        data: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          ...(form.email.trim() ? { email: form.email.trim() } : {}),
          ...(form.contentField.trim() ? { contentField: form.contentField.trim() } : {}),
          ...(form.experience.trim() ? { experience: form.experience.trim() } : {}),
          ...(form.goal.trim() ? { goal: form.goal.trim() } : {}),
          ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
        },
      },
      {
        onSuccess: (receipt) => {
          if (receipt.success) {
            setSubmitted(true);
            setMessage(receipt.message || 'وصلنا طلبك، وسنتواصل معك قريباً.');
          } else {
            setSubmitted(false);
            setMessage(receipt.message || 'لم نتمكن من إرسال طلبك. حاول مرة أخرى.');
          }
        },
        onError: () => {
          setSubmitted(false);
          setMessage('تعذر إرسال الطلب الآن. تحقق من اتصالك وحاول مرة أخرى.');
        },
      },
    );
  };

  return (
    <main dir="rtl" className="salas-page">
      <header className="site-header">
        <a href="#البداية" className="brand" aria-label="ورشة سلس، إلى البداية">
          <img src={salasLogo} alt="شعار سلس" />
          <span>ورشة سلس</span>
        </a>
        <nav aria-label="التنقل الرئيسي">
          <a href="#عن-الورشة">عن الورشة</a>
          <a href="#ماذا-ستتعلم">ماذا ستتعلم</a>
          <a href="#التسجيل">التسجيل</a>
        </nav>
        <a className="header-cta" href="#التسجيل">احجز مقعدك <ArrowLeft size={16} /></a>
      </header>

      <section className="hero" id="البداية">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> مساحة للمبدعين وصنّاع المحتوى</div>
          <h1>خلّ فكرتك<br /><span>تلقى صوتها.</span></h1>
          <p className="hero-lede">ورشة عملية تساعدك ترتّب أفكارك، وتبني حضوراً يشبهك — من أول خاطر إلى محتوى يستحق أن يُرى.</p>
          <div className="hero-actions">
            <a className="button button-light" href="#التسجيل">ابدأ رحلتك <ArrowLeft size={18} /></a>
            <a className="text-link" href="#عن-الورشة">اكتشف تفاصيل الورشة <ArrowDown size={15} /></a>
          </div>
          <div className="hero-note"><span className="tiny-rule" /> التفاصيل هنا مبدئية وقابلة للتحديث</div>
        </div>
        <div className="hero-art" aria-label="شعار سلس داخل مساحة حمراء هادئة">
          <div className="art-ring ring-one" /><div className="art-ring ring-two" />
          <div className="art-label label-top">مساحة للتجربة</div>
          <div className="logo-stage"><img src={salasLogo} alt="" /></div>
          <div className="art-label label-bottom">فكرة ← صوت ← أثر</div>
          <span className="art-star star-one" aria-hidden="true" /><span className="art-star star-two" aria-hidden="true" />
        </div>
        <div className="hero-index"><span>٠١</span><span className="index-line" /><span>٠٣</span></div>
      </section>

      <section className="intro-section" id="عن-الورشة">
        <div className="section-kicker"><span>٠١</span> الفكرة ببساطة</div>
        <div className="intro-grid">
          <h2>مو محتوى أكثر.<br /><em>محتوى أوضح.</em></h2>
          <div className="intro-text">
            <p>ورشة سلس مساحة تعلّم وتجريب للمبدعين. نبدأ من الفكرة التي تشغلك، ثم نرتّبها في رسالة واضحة وخطوات قابلة للتطبيق.</p>
            <p>هذه الصفحة تعرض تصوراً أولياً للورشة؛ نحدّث التفاصيل والأسئلة كلما اتضحت التجربة أكثر.</p>
            <a href="#التسجيل" className="underlined-link">عرّفنا عنك <ArrowUpLeft size={16} /></a>
          </div>
        </div>
        <div className="statement-strip"><span>الفكرة الجيدة تستحق مساحة.</span><span className="strip-mark">سلس / ورشة للمبدعين</span></div>
      </section>

      <section className="learning-section" id="ماذا-ستتعلم">
        <div className="learning-heading">
          <div><div className="section-kicker light-kicker"><span>٠٢</span> تجربة الورشة</div><h2>من الفكرة<br />إلى الخطوة التالية.</h2></div>
          <p>محطات مقترحة نعمل من خلالها على تحويل الإلهام إلى ممارسة واضحة — بهدوء، ومن دون وصفات جاهزة.</p>
        </div>
        <div className="steps-list">
          <article className="step-row"><div className="step-number">١</div><div className="step-icon"><MessageCircle size={21} /></div><div className="step-copy"><h3>اكتشاف صوتك</h3><p>نلتقط ما يميزك، ونحدّد الموضوعات التي تهمك فعلاً.</p></div><span className="step-tag">ابدأ من ذاتك</span></article>
          <article className="step-row"><div className="step-number">٢</div><div className="step-icon"><Layers3 size={21} /></div><div className="step-copy"><h3>ترتيب الفكرة</h3><p>نصوغ الفكرة في زاوية ورسالة يفهمها جمهورك.</p></div><span className="step-tag">وضوح قبل النشر</span></article>
          <article className="step-row"><div className="step-number">٣</div><div className="step-icon"><Feather size={21} /></div><div className="step-copy"><h3>صناعة محتوى يشبهك</h3><p>نجرّب أشكالاً مناسبة لك، ونرسم لها بداية عملية.</p></div><span className="step-tag">خطوة قابلة للتطبيق</span></article>
        </div>
        <div className="learning-footnote"><CircleDot size={14} /> محاور مبدئية قابلة للتعديل بحسب احتياج المشاركين.</div>
      </section>

      <section className="fit-section">
        <div className="fit-title"><div className="section-kicker"><span>٠٣</span> لمن هذه المساحة؟</div><h2>لك، إذا كان<br />في بالك شيء.</h2></div>
        <div className="fit-content">
          <p>للمبدع الذي يريد أن يبدأ، ولصانع المحتوى الذي يبحث عن اتجاه، ولكل شخص لديه فكرة تستحق أن تأخذ شكلها.</p>
          <div className="fit-points">
            <div><span>أ</span><p>تريد بداية أوضح لصناعة المحتوى.</p></div>
            <div><span>ب</span><p>تبحث عن طريقة تعبّر بها عن خبرتك.</p></div>
            <div><span>ج</span><p>تحتاج مساحة هادئة لترتيب أفكارك.</p></div>
          </div>
          <div className="fit-note"><Sparkles size={16} /> لا تحتاج أن تكون جاهزاً بالكامل؛ يكفي أن تكون فضولياً.</div>
        </div>
      </section>

      <section className="registration-section" id="التسجيل">
        <div className="registration-intro">
          <div className="section-kicker light-kicker"><span>٠٤</span> خطوتك الأولى</div>
          <h2>خلّنا نعرف<br />وش يشغلك.</h2>
          <p>أجب عن الأسئلة التالية، وسنستخدم إجاباتك لفهم احتياجك وصياغة تجربة أقرب لك.</p>
          <div className="registration-stamp"><img src={salasLogo} alt="" /><span>مساحة تبدأ<br />منك</span></div>
        </div>
        <form className="registration-form" onSubmit={submit}>
          <div className="form-topline"><span>نموذج اهتمام مبدئي</span><span>الحقول ذات العلامة * مطلوبة</span></div>
          <div className="form-row">
            <label>الاسم الكامل <b>*</b><input data-testid="input-full-name" required minLength={2} maxLength={120} autoComplete="name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="كيف نناديك؟" /></label>
            <label>رقم الجوال <b>*</b><input data-testid="input-phone" required minLength={7} maxLength={30} autoComplete="tel" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="رقم للتواصل" /></label>
          </div>
          <label>البريد الإلكتروني <span className="optional">اختياري</span><input data-testid="input-email" type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="بريدك الإلكتروني" dir="auto" /></label>
          <div className="form-divider"><span>أسئلة تساعدنا نجهّز مساحة مناسبة لك</span><i /></div>
          <label>ما المجال الذي تصنع فيه محتواك؟ <span className="optional">قابل للتعديل</span><input data-testid="input-content-field" maxLength={120} value={form.contentField} onChange={(e) => update('contentField', e.target.value)} placeholder="مثال: تعليم، فن، ريادة أعمال..." /></label>
          <label>كيف تصف تجربتك الحالية؟ <span className="optional">قابل للتعديل</span><textarea data-testid="input-experience" maxLength={120} rows={2} value={form.experience} onChange={(e) => update('experience', e.target.value)} placeholder="في البداية، أنشر باستمرار، أبحث عن اتجاه..." /></label>
          <label>ما الذي تتمنى أن تخرج به من الورشة؟ <span className="optional">قابل للتعديل</span><textarea data-testid="input-goal" maxLength={500} rows={2} value={form.goal} onChange={(e) => update('goal', e.target.value)} placeholder="اكتب ما يخطر ببالك..." /></label>
          <label>هل هناك شيء آخر تحب أن نعرفه؟ <span className="optional">اختياري</span><textarea data-testid="input-notes" maxLength={1000} rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="أي ملاحظة أو سؤال..." /></label>
          {message && <div className={`form-feedback ${submitted ? 'is-success' : 'is-error'}`} role="status" aria-live="polite">{submitted && <Check size={18} />}<span>{message}</span></div>}
          <button data-testid="button-submit" className="button button-submit" type="submit" disabled={registration.isPending}>
            {registration.isPending ? <><span className="pending-dot" /> جارٍ إرسال طلبك</> : submitted ? <>تم إرسال اهتمامك <Check size={18} /></> : <>أرسل اهتمامك <ArrowLeft size={18} /></>}
          </button>
          <p className="form-privacy">إجاباتك تساعدنا على فهم احتياجك، ولن نطلب منك أكثر مما يلزم لهذه الخطوة.</p>
        </form>
      </section>

      <footer className="site-footer">
        <a href="#البداية" className="footer-brand"><img src={salasLogo} alt="" /> ورشة سلس</a>
        <span>مساحة للمبدعين كي يجدوا صوتهم.</span>
        <div className="footer-socials" aria-label="حسابات ورشة سلس">
          <a className="footer-social" href="https://www.instagram.com/sls___brand" target="_blank" rel="noopener noreferrer" aria-label="حساب ورشة سلس على إنستغرام">
            <Instagram size={16} aria-hidden="true" />
            <span>إنستغرام</span>
          </a>
          <a className="footer-social" href="https://wa.me/9647757660888" target="_blank" rel="noopener noreferrer" aria-label="تواصل مع ورشة سلس عبر واتساب">
            <MessageCircle size={16} aria-hidden="true" />
            <span>واتساب</span>
          </a>
        </div>
        <a href="#البداية" className="back-top">العودة للأعلى <MoveUpLeft size={15} /></a>
      </footer>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
