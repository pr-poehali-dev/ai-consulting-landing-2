import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/fa0581b6-0ed3-4d4f-b4b6-f5a00582d0d3/files/a51f8002-cba3-4e2b-a859-9b9d083dd275.jpg";

const cases = [
  {
    tag: "Ритейл",
    title: "Автоматизация клиентского сервиса",
    description: "Внедрили AI-агента для обработки заявок и ответов на вопросы покупателей. Сократили нагрузку на команду поддержки в 3 раза.",
    metrics: [
      { value: "−68%", label: "обращений к операторам" },
      { value: "4 мес", label: "срок окупаемости" },
      { value: "×3.2", label: "рост удовлетворённости" },
    ],
  },
  {
    tag: "Логистика",
    title: "Предиктивное планирование маршрутов",
    description: "Разработали модель прогнозирования спроса и оптимизации маршрутов доставки на основе исторических данных и внешних факторов.",
    metrics: [
      { value: "−22%", label: "топливных затрат" },
      { value: "89%", label: "точность прогнозов" },
      { value: "$1.2M", label: "экономия в год" },
    ],
  },
  {
    tag: "Финтех",
    title: "AI-скоринг для кредитных решений",
    description: "Создали систему оценки рисков на основе нестандартных данных. Банк сократил долю дефолтов и ускорил время выдачи решения.",
    metrics: [
      { value: "−40%", label: "уровень дефолтов" },
      { value: "8 сек", label: "время скоринга" },
      { value: "+31%", label: "одобряемость заявок" },
    ],
  },
];

function useIntersection(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

function CaseCard({ c, index }: { c: typeof cases[0]; index: number }) {
  const { ref, visible } = useIntersection();
  return (
    <div
      ref={ref}
      className="border border-[#2a2a2a] p-8 flex flex-col gap-6 hover:border-[#FACC15] transition-all duration-500 group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s, border-color 0.3s`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-xs font-body font-medium tracking-widest text-[#FACC15] uppercase">
          {c.tag}
        </span>
        <Icon name="ArrowUpRight" size={16} className="text-[#555] group-hover:text-[#FACC15] transition-colors" />
      </div>

      <div>
        <h3 className="font-display text-2xl text-white leading-tight mb-3">
          {c.title}
        </h3>
        <p className="font-body text-sm text-[#888] leading-relaxed font-light">
          {c.description}
        </p>
      </div>

      <div className="mt-auto pt-6 border-t border-[#2a2a2a] grid grid-cols-3 gap-4">
        {c.metrics.map((m) => (
          <div key={m.label}>
            <div className="font-display text-2xl text-[#FACC15]">{m.value}</div>
            <div className="font-body text-xs text-[#666] mt-1 leading-tight">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SUBMIT_URL = "https://functions.poehali.dev/80f517e5-8955-4637-963c-aaa33de09bd0";

type FormStatus = "idle" | "submitting" | "success" | "error";

function ContactForm() {
  const { ref, visible } = useIntersection(0.1);
  const [form, setForm] = useState({ name: "", company: "", email: "", message: "" });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Что-то пошло не так. Попробуйте ещё раз.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Ошибка соединения. Проверьте интернет и попробуйте снова.");
    }
  };

  return (
    <section id="contact" className="py-32 px-6 border-t border-[#2a2a2a]">
      <div className="max-w-5xl mx-auto">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div>
            <span className="text-xs font-body tracking-widest text-[#FACC15] uppercase">Контакт</span>
            <h2 className="font-display text-6xl md:text-7xl text-white mt-4 leading-none">
              ОБСУДИМ<br />
              <span className="text-[#FACC15]">ПРОЕКТ?</span>
            </h2>
            <p className="font-body text-[#888] mt-6 text-sm leading-relaxed font-light max-w-sm">
              Расскажите о задаче — мы проведём бесплатный экспресс-аудит и предложим конкретные точки применения AI.
            </p>

            <div className="mt-10 flex flex-col gap-5">
              {[
                { icon: "MapPin", text: "Тбилиси, Грузия" },
                { icon: "Mail", text: "hello@arkhi.ai" },
                { icon: "MessageCircle", text: "Telegram: @arkhiai" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-[#666] font-body text-sm">
                  <Icon name={item.icon as "MapPin"} size={14} className="text-[#FACC15]" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div>
            {status === "success" ? (
              <div className="border border-[#FACC15] p-10 text-center">
                <div className="font-display text-4xl text-[#FACC15] mb-3">ПОЛУЧИЛИ!</div>
                <p className="font-body text-[#888] text-sm">Заявка принята, ответим в течение 24 часов.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {[
                  { name: "name", placeholder: "Имя", type: "text" },
                  { name: "company", placeholder: "Компания", type: "text" },
                  { name: "email", placeholder: "Email *", type: "email" },
                ].map((field) => (
                  <input
                    key={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    disabled={status === "submitting"}
                    className="w-full bg-transparent border border-[#2a2a2a] px-5 py-4 font-body text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#FACC15] transition-colors disabled:opacity-50"
                    required={field.name === "email"}
                  />
                ))}
                <textarea
                  placeholder="Опишите задачу или проект"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  disabled={status === "submitting"}
                  rows={4}
                  className="w-full bg-transparent border border-[#2a2a2a] px-5 py-4 font-body text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#FACC15] transition-colors resize-none disabled:opacity-50"
                />
                {status === "error" && (
                  <p className="font-body text-xs text-red-400">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-2 bg-[#FACC15] text-[#0F0F0F] font-body font-semibold text-sm tracking-wider uppercase px-8 py-4 hover:bg-white transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === "submitting" ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Отправляем...
                    </>
                  ) : "Отправить заявку"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, []);

  const { ref: casesRef, visible: casesVisible } = useIntersection(0.05);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white overflow-x-hidden">

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between transition-all duration-300"
        style={{
          background: scrolled ? "rgba(15,15,15,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid #2a2a2a" : "1px solid transparent",
        }}
      >
        <div className="font-display text-2xl tracking-wider">
          ARKHI <span className="text-[#FACC15]">AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Кейсы", href: "#cases" },
            { label: "Подход", href: "#approach" },
            { label: "Контакт", href: "#contact" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-body text-xs tracking-widest uppercase text-[#888] hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
        <a
          href="#contact"
          className="font-body text-xs font-medium tracking-widest uppercase border border-[#FACC15] text-[#FACC15] px-5 py-2 hover:bg-[#FACC15] hover:text-[#0F0F0F] transition-all duration-200"
        >
          Связаться
        </a>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-end pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/60 to-[#0F0F0F]/20" />
          <div className="absolute inset-0 grid-bg" />
        </div>

        <div
          className="absolute left-0 top-0 w-px bg-[#FACC15] origin-top"
          style={{
            height: heroVisible ? "100%" : "0",
            transition: "height 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s",
          }}
        />

        <div className="relative z-10 px-6 md:px-16 max-w-7xl mx-auto w-full">
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "none" : "translateY(50px)",
              transition: "opacity 1s ease 0.2s, transform 1s ease 0.2s",
            }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-[#FACC15]" />
              <span className="font-body text-xs tracking-widest uppercase text-[#FACC15]">
                AI-консалтинг · Тбилиси
              </span>
            </div>

            <h1 className="font-display text-[clamp(4rem,12vw,11rem)] leading-none text-white">
              МЫ ВНЕДРЯЕМ<br />
              <span className="text-[#FACC15]">ИСКУССТВЕННЫЙ</span><br />
              ИНТЕЛЛЕКТ
            </h1>

            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <a
                href="#contact"
                className="bg-[#FACC15] text-[#0F0F0F] font-body font-semibold text-xs tracking-widest uppercase px-10 py-4 hover:bg-white transition-colors duration-200"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transition: "opacity 0.8s ease 0.7s",
                }}
              >
                Обсудить проект
              </a>
              <a
                href="#cases"
                className="flex items-center gap-2 font-body text-xs tracking-widest uppercase text-[#888] hover:text-white transition-colors"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transition: "opacity 0.8s ease 0.9s",
                }}
              >
                Смотреть кейсы
                <Icon name="ArrowDown" size={14} />
              </a>
            </div>
          </div>

          <div
            className="mt-20 grid grid-cols-3 gap-8 border-t border-[#2a2a2a] pt-8"
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 0.8s ease 1.1s",
            }}
          >
            {[
              { n: "40+", t: "реализованных проектов" },
              { n: "5 лет", t: "в AI-индустрии" },
              { n: "$12M+", t: "сэкономлено клиентам" },
            ].map((s) => (
              <div key={s.n}>
                <div className="font-display text-3xl md:text-4xl text-[#FACC15]">{s.n}</div>
                <div className="font-body text-xs text-[#666] mt-1 leading-tight">{s.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section id="approach" className="py-24 px-6 border-t border-[#2a2a2a]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-body tracking-widest text-[#FACC15] uppercase">Подход</span>
              <h2 className="font-display text-5xl md:text-6xl text-white mt-4 leading-none">
                НЕ ХАЙП.<br />РЕЗУЛЬТАТ.
              </h2>
            </div>
            <div className="flex flex-col gap-8">
              {[
                { n: "01", t: "Диагностика", d: "Анализируем процессы и выявляем точки роста, где AI даёт максимальный ROI." },
                { n: "02", t: "Прототип за 2 недели", d: "Быстро собираем MVP-решение и проверяем гипотезу на реальных данных." },
                { n: "03", t: "Масштабирование", d: "Интегрируем проверенное решение в инфраструктуру и обучаем команду." },
              ].map((step) => (
                <div key={step.n} className="flex gap-6">
                  <div className="font-display text-sm text-[#FACC15] pt-1 opacity-60">{step.n}</div>
                  <div>
                    <div className="font-body font-medium text-white text-sm mb-1">{step.t}</div>
                    <div className="font-body text-xs text-[#666] leading-relaxed font-light">{step.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CASES */}
      <section id="cases" className="py-24 px-6 border-t border-[#2a2a2a]">
        <div className="max-w-5xl mx-auto">
          <div
            ref={casesRef}
            style={{
              opacity: casesVisible ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          >
            <div className="flex items-end justify-between mb-14">
              <div>
                <span className="text-xs font-body tracking-widest text-[#FACC15] uppercase">Кейсы</span>
                <h2 className="font-display text-5xl md:text-6xl text-white mt-4 leading-none">
                  РЕЗУЛЬТАТЫ<br />В ЦИФРАХ
                </h2>
              </div>
              <a
                href="#contact"
                className="hidden md:flex items-center gap-2 font-body text-xs text-[#888] hover:text-white transition-colors uppercase tracking-widest"
              >
                Все кейсы <Icon name="ArrowRight" size={14} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2a2a2a]">
            {cases.map((c, i) => (
              <div key={c.title} className="bg-[#0F0F0F]">
                <CaseCard c={c} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <ContactForm />

      {/* FOOTER */}
      <footer className="px-6 py-10 border-t border-[#2a2a2a]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-xl tracking-wider">
            ARKHI <span className="text-[#FACC15]">AI</span>
          </div>
          <p className="font-body text-xs text-[#555]">
            © 2024 Arkhi AI. Тбилиси, Грузия.
          </p>
          <div className="flex gap-6">
            {["Telegram", "LinkedIn"].map((s) => (
              <a key={s} href="#" className="font-body text-xs text-[#555] hover:text-white transition-colors uppercase tracking-widest">
                {s}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}