import { type FormEvent, type ReactNode } from 'react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateWorkshopRegistration } from '@workspace/api-client-react';
import { ArrowDown, ArrowLeft, Camera, Check, ChevronDown, Clock3, Instagram, MapPin, MessageCircle, MoveUpLeft, Smartphone, Sparkles } from 'lucide-react';
import salasLogo from '@/assets/salas-logo.png';
import { curriculum, programDays, workshopFaq } from './workshop-content';
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
const toArabicDigits = (value: number) => String(value).replace(/\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);

function Home() {
  const registration = useCreateWorkshopRegistration();
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    subscriptionPlan: '',
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
    const firstEmptyField = Object.entries(form).find(
      ([, value]) => !value.trim(),
    )?.[0];

    if (firstEmptyField) {
      event.currentTarget
        .querySelector<HTMLInputElement | HTMLTextAreaElement>(
          `[name="${firstEmptyField}"]`,
        )
        ?.focus();
      setSubmitted(false);
      setMessage('كل الحقول مطلوبة. اكتب إجابة لكل سؤال.');
      return;
    }

    const selectedPlan = (
      ['full', 'installments', 'single-day'] as const
    ).find((plan) => plan === form.subscriptionPlan);

    if (!selectedPlan) {
      setSubmitted(false);
      setMessage('اختار نوع الاشتراك حتى نكمل طلبك.');
      return;
    }

    registration.mutate(
      {
        data: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          subscriptionPlan: selectedPlan,
          contentField: form.contentField.trim(),
          experience: form.experience.trim(),
          goal: form.goal.trim(),
          notes: form.notes.trim(),
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
        onError: (error) => {
          setSubmitted(false);
          const serverMessage =
            error.data &&
            'error' in error.data &&
            typeof error.data.error === 'string'
              ? error.data.error
              : undefined;
          setMessage(
            serverMessage || 'تعذر إرسال الطلب الآن. تحقق من اتصالك وحاول مرة أخرى.',
          );
        },
      },
    );
  };

  return (
    <div dir="rtl" className="salas-page">
      <header className="site-header">
        <a href="#home" className="brand" aria-label="ورشة سلس، إلى البداية">
          <img src={salasLogo} alt="" />
          <span>ورشة سلس</span>
        </a>
        <nav aria-label="التنقل الرئيسي">
          <a href="#about">عن الورشة</a>
          <a href="#skills">شنو راح تتعلم</a>
          <a href="#program">برنامج الأيام</a>
          <a href="#pricing">الأجور</a>
        </nav>
        <a className="header-cta" href="#register">سجّل اهتمامك <ArrowLeft size={16} /></a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> ورشة صناعة الفيديو والمحتوى الرقمي</div>
          <h1>فكرتك<br /><span>تصير فيديو.</span></h1>
            <p className="hero-lede">بخمسة أيام تطبيق عملي، تعلّم تختار فكرة، تكتب افتتاحية جذابة، تصوّر بالموبايل وتمنتج على CapCut — حتى لو تبدي من الصفر.</p>
            <div className="hero-facts">
              <span><Clock3 size={16} /> خمسة أيام تدريب</span>
              <span><Camera size={16} /> تطبيق وتصوير فعلي</span>
              <span><Smartphone size={16} /> iPhone شرط أساسي</span>
              <span>١٢٥٬٠٠٠ د.ع للورشة كاملة</span>
            </div>
            <div className="hero-actions">
              <a className="button button-light" href="#register">قدّم طلب اهتمامك <ArrowLeft size={18} /></a>
              <a className="text-link" href="https://wa.me/9647757660888" target="_blank" rel="noopener noreferrer">اسألنا على واتساب <MessageCircle size={16} /></a>
            </div>
            <div className="hero-note"><span className="tiny-rule" /> التسجيل يبدأ بطلب اهتمام؛ نرسل التفاصيل قبل التأكيد.</div>
          </div>
          <div className="hero-art">
            <div className="art-ring ring-one" /><div className="art-ring ring-two" />
            <div className="art-label label-top">من الفكرة إلى الفيديو</div>
            <div className="logo-stage"><img src={salasLogo} alt="شعار ورشة سلس" /></div>
            <div className="art-label label-bottom">فكرة ← تصوير ← مونتاج</div>
            <span className="art-star star-one" aria-hidden="true" /><span className="art-star star-two" aria-hidden="true" />
          </div>
        </section>

        <section className="intro-section" id="about">
          <div className="section-kicker"><span>٠١</span> تعلّم بالممارسة</div>
          <div className="intro-grid">
            <h2>مو بس تمسك موبايل.<br /><em>تسوي فيديو يحچي.</em></h2>
            <div className="intro-text">
              <p>صناعة الفيديو تبدأ من فكرة واضحة وقصة قصيرة وافتتاحية تشد المشاهد، وبعدها يجي التصوير والمونتاج والصوت المناسب.</p>
              <p>بورشة سلس راح تطبق هالخطوات بنفسك، وتتعلم شلون تحول فكرة بسيطة إلى محتوى قابل للنشر على TikTok وInstagram.</p>
              <a href="#program" className="underlined-link">شوف برنامج الأيام <ArrowDown size={16} /></a>
            </div>
          </div>
          <div className="statement-strip"><span>تعلّم. صوّر. مونتج. انشر.</span><span className="strip-mark">خمسة أيام من التطبيق العملي</span></div>
        </section>

        <section className="curriculum-section" id="skills">
          <div className="curriculum-heading">
            <div>
              <div className="section-kicker"><span>٠٢</span> المهارات اللي راح تكتسبها</div>
              <h2>من أول فكرة<br /><em>إلى فيديو جاهز.</em></h2>
            </div>
            <p>خطوات صناعة الفيديو كلها بمكان واحد: تختار شنو تحچي، شلون تصوره، وشلون ترتبه حتى يصير واضح وممتع.</p>
          </div>
          <div className="curriculum-grid">
            {curriculum.map((topic, index) => (
              <article className="curriculum-card" key={topic.title}>
                <span className="topic-index">{toArabicDigits(index + 1).padStart(2, '٠')}</span>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
              </article>
            ))}
          </div>
          <div className="curriculum-note"><Sparkles size={16} /> مو محاضرات نظرية وبس — راح تصور، تجرب، وتتعلم من مراجعة شغلك.</div>
        </section>

        <section className="fit-section">
          <div className="fit-title"><div className="section-kicker"><span>٠٣</span> لمن تناسب الورشة؟</div><h2>إلك إذا<br />عندك فكرة.</h2></div>
          <div className="fit-content">
            <p>سواء تريد تسوّق لمشروعك بنفسك، أو تتعلم مهارة جديدة، أو تبدي طريقك بصناعة المحتوى — راح تشتغل على فيديوهاتك خطوة بخطوة.</p>
            <div className="fit-points">
              <div><span>أ</span><p>أصحاب البراندات والمشاريع الصغيرة.</p></div>
              <div><span>ب</span><p>المبتدئين اللي يريدون يتعلمون من الصفر.</p></div>
              <div><span>ج</span><p>اللي يريد يطور مهارته ويفتح فرص عمل بالمحتوى.</p></div>
            </div>
            <div className="fit-note"><Smartphone size={17} /> الشرط الأساسي: جهاز iPhone. الخبرة السابقة مو مطلوبة.</div>
          </div>
        </section>

        <section className="program-section" id="program">
          <div className="program-heading">
            <div>
              <div className="section-kicker"><span>٠٤</span> البرنامج التدريبي</div>
              <h2>خمسة أيام،<br /><em>كل يوم خطوة.</em></h2>
            </div>
            <p>تبدأ من الفكرة، وتوصل للتصوير والمونتاج والنشر عبر تمارين ومراجعة جماعية.</p>
          </div>
          <div className="program-list">
            {programDays.map((day, index) => (
              <article className="program-card" key={day.day}>
                <div className="program-day"><span>{toArabicDigits(index + 1).padStart(2, '٠')}</span><small>{day.day}</small></div>
                <div className="program-content">
                  <h3>{day.title}</h3>
                  <p className="program-intro">{day.intro}</p>
                  {day.place && <p className="program-place"><MapPin size={16} /> {day.place}</p>}
                  <ul>{day.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <Camera className="program-icon" size={22} aria-hidden="true" />
              </article>
            ))}
          </div>
          <p className="program-note">تفاصيل الموعد والمكان الرئيسي، وأوقات التجمع والتنقل، نرسلها للمهتمين قبل تأكيد التسجيل.</p>
          <aside className="challenge-callout" aria-labelledby="challenge-title">
            <div className="challenge-label"><Sparkles size={18} aria-hidden="true" /> التحدي الأكبر بعد الورشة</div>
            <h3 id="challenge-title">الأيام الخمسة تخلص.<br />بس التحدي يبدي!</h3>
            <p className="challenge-intro">مو بس نعلّمك تصور وتمنتج؛ نريد نشوف شنو راح تصنع بمهاراتك الجديدة، ونحتفل بأول خطوة إلك بصناعة المحتوى.</p>
            <ol className="challenge-steps">
              <li><strong>باليوم الخامس</strong><p>نجمع فيديوهاتكم وننشر الأعمال على صفحات سلس الرسمية، بموافقة أصحابها، حتى نعرّف الجمهور بإبداعاتكم.</p></li>
              <li><strong>خلال أسبوعين</strong><p>نتابع أداء الفيديوهات وعدد المشاهدات والتفاعل، ونشوف شلون طبقتوا اللي تعلمتوه خلال الورشة.</p></li>
              <li><strong>بالورشة الثانية</strong><p>بعد أسبوعين، ندعو المشاركين المتميزين من الورشة الأولى للحضور ويانه، ونعلن صاحب أعلى أداء ومشاهدات.</p></li>
            </ol>
            <div className="challenge-prize"><Sparkles size={20} aria-hidden="true" /><p>جائزة قيّمة بانتظار الفائز.<br /><strong>شنو هي؟ تبقى مفاجأة ليوم الورشة الثانية.</strong></p></div>
            <p className="challenge-note">معايير التقييم وطريقة احتساب النتائج نوضحها للمشاركين قبل بدء التحدي. المشاهدات والانتشار مو مضمونين.</p>
          </aside>
        </section>

        <section className="pricing-section" id="pricing">
          <div className="pricing-copy">
            <div className="section-kicker"><span>٠٥</span> الأجور وطريقة الدفع</div>
            <h2>كل التفاصيل<br /><em>واضحة من البداية.</em></h2>
            <p>حددنا الأجور حتى تغطي استئجار المكان وتنظيم الورشة والأنشطة العملية. هدفنا نبني مهارة ومجتمع لصناعة المحتوى العراقي.</p>
            <a className="text-link pricing-contact" href="https://wa.me/9647757660888" target="_blank" rel="noopener noreferrer">عندك سؤال عن الدفع؟ راسلنا <MessageCircle size={16} /></a>
          </div>
          <div className="price-card">
            <div className="price-total-label">إجمالي الأيام الخمسة</div>
            <div className="price-total">١٢٥٬٠٠٠ <span>دينار عراقي</span></div>
            <div className="price-per-day">٢٥٬٠٠٠ دينار لليوم الواحد</div>
            <div className="payment-options">
              <article><span>الخيار الأول</span><h3>دفع كامل</h3><p>١٢٥٬٠٠٠ دينار قبل بدء الورشة.</p></article>
              <article><span>الخيار الثاني</span><h3>على دفعتين</h3><p>٧٥٬٠٠٠ دينار للأيام الثلاثة الأولى، و٥٠٬٠٠٠ دينار قبل اليوم الرابع.</p></article>
              <article><span>الخيار الثالث</span><h3>يوم واحد</h3><p>٢٥٬٠٠٠ دينار عن يوم واحد من أيام الورشة.</p></article>
            </div>
            <a className="button price-cta" href="#register">سجّل اهتمامك <ArrowLeft size={17} /></a>
          </div>
        </section>

        <section className="registration-section" id="register">
          <div className="registration-intro">
            <div className="section-kicker light-kicker"><span>٠٦</span> ابدأ بطلب اهتمام</div>
            <h2>خلّنا نعرف<br />شنو تريد تتعلم.</h2>
            <p>املأ النموذج حتى نتواصل وياك ونرسل تفاصيل الموعد والمكان وخطوات التأكيد.</p>
            <a className="registration-whatsapp" href="https://wa.me/9647757660888" target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> أو راسلنا مباشرة على واتساب</a>
            <div className="registration-stamp"><img src={salasLogo} alt="" /><span>فكرتك تستحق<br />تنصوّر</span></div>
          </div>
          <form className="registration-form" onSubmit={submit}>
            <div className="form-topline"><span>طلب اهتمام بالورشة</span><span>كل الحقول مطلوبة</span></div>
            <div className="form-notice"><Smartphone size={17} /><span>تذكير: امتلاك iPhone شرط أساسي. إرسال الطلب مو تأكيد حجز نهائي.</span></div>
            <div className="form-row">
              <label>الاسم الكامل <b aria-hidden="true">*</b><input data-testid="input-full-name" name="fullName" required minLength={2} maxLength={120} autoComplete="name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="كيف نناديك؟" /></label>
              <label>رقم الجوال <b aria-hidden="true">*</b><input data-testid="input-phone" name="phone" required minLength={7} maxLength={30} autoComplete="tel" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="رقم للتواصل" /></label>
            </div>
            <label>البريد الإلكتروني <b aria-hidden="true">*</b><input data-testid="input-email" name="email" type="email" required maxLength={254} autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="بريدك الإلكتروني" dir="auto" /></label>
            <fieldset className="plan-picker">
              <legend>شنو نوع الاشتراك اللي يناسبك؟ <b aria-hidden="true">*</b></legend>
              <div className="plan-options">
                <label className={`plan-option ${form.subscriptionPlan === 'full' ? 'is-selected' : ''}`}>
                  <input data-testid="option-plan-full" type="radio" name="subscriptionPlan" value="full" required checked={form.subscriptionPlan === 'full'} onChange={(e) => update('subscriptionPlan', e.target.value)} />
                  <span className="plan-option-copy"><strong>الورشة كاملة — ١٢٥٬٠٠٠ دينار</strong><small>دفع كامل قبل بدء الورشة.</small></span>
                </label>
                <label className={`plan-option ${form.subscriptionPlan === 'installments' ? 'is-selected' : ''}`}>
                  <input data-testid="option-plan-installments" type="radio" name="subscriptionPlan" value="installments" required checked={form.subscriptionPlan === 'installments'} onChange={(e) => update('subscriptionPlan', e.target.value)} />
                  <span className="plan-option-copy"><strong>الورشة كاملة — على دفعتين</strong><small>٧٥٬٠٠٠ دينار للأيام الثلاثة الأولى، و٥٠٬٠٠٠ قبل اليوم الرابع.</small></span>
                </label>
                <label className={`plan-option ${form.subscriptionPlan === 'single-day' ? 'is-selected' : ''}`}>
                  <input data-testid="option-plan-single-day" type="radio" name="subscriptionPlan" value="single-day" required checked={form.subscriptionPlan === 'single-day'} onChange={(e) => update('subscriptionPlan', e.target.value)} />
                  <span className="plan-option-copy"><strong>يوم واحد — ٢٥٬٠٠٠ دينار</strong><small>٢٥٬٠٠٠ دينار عن يوم واحد من أيام الورشة.</small></span>
                </label>
              </div>
            </fieldset>
            <div className="form-divider"><span>حتى نعرف شلون نساعدك</span><i /></div>
            <label>شنو نوع المحتوى أو الفيديوهات اللي تريد تتعلمها؟ <b aria-hidden="true">*</b><input data-testid="input-content-field" name="contentField" required maxLength={120} value={form.contentField} onChange={(e) => update('contentField', e.target.value)} placeholder="مثال: محتوى لمشروعي، فيديوهات تعليمية..." /></label>
            <label>هل سبق لك صورت أو منتجت فيديو؟ <b aria-hidden="true">*</b><textarea data-testid="input-experience" name="experience" required maxLength={120} rows={2} value={form.experience} onChange={(e) => update('experience', e.target.value)} placeholder="احچيلنا باختصار عن تجربتك..." /></label>
            <label>شنو هدفك من المشاركة؟ <b aria-hidden="true">*</b><textarea data-testid="input-goal" name="goal" required maxLength={500} rows={2} value={form.goal} onChange={(e) => update('goal', e.target.value)} placeholder="شنو تحب تعرف أو تسوي بنهاية الورشة؟" /></label>
            <label>عندك سؤال أو ملاحظة؟ <b aria-hidden="true">*</b><textarea data-testid="input-notes" name="notes" required maxLength={850} rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="اكتب أي سؤال تحب نجاوبك عليه..." /></label>
            {message && <div className={`form-feedback ${submitted ? 'is-success' : 'is-error'}`} role="status" aria-live="polite">{submitted && <Check size={18} />}<span>{message}</span></div>}
            <button data-testid="button-submit" className="button button-submit" type="submit" disabled={registration.isPending}>
              {registration.isPending ? <><span className="pending-dot" /> جارٍ إرسال طلبك</> : submitted ? <>وصل طلبك <Check size={18} /></> : <>أرسل طلب الاهتمام <ArrowLeft size={18} /></>}
            </button>
            <p className="form-privacy">نستخدم بياناتك للتواصل وياك بخصوص الورشة وترتيب التسجيل.</p>
          </form>
        </section>

        <section className="faq-section" id="faq">
          <div className="faq-heading">
            <div className="section-kicker"><span>٠٧</span> قبل ما تسجل</div>
            <h2>أسئلة تتكرر.</h2>
          </div>
          <div className="faq-list">
            {workshopFaq.map((item) => (
              <details className="faq-item" key={item.question}>
                <summary>{item.question}<ChevronDown size={18} aria-hidden="true" /></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a href="#home" className="footer-brand"><img src={salasLogo} alt="" /> ورشة سلس</a>
        <span>ورشة صناعة الفيديو والمحتوى الرقمي.</span>
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
        <a href="#home" className="back-top">العودة للأعلى <MoveUpLeft size={15} /></a>
      </footer>
    </div>
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
