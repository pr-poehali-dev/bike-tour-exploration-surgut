import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const HERO_IMG = "https://cdn.poehali.dev/projects/09ed16a7-04d1-460a-bcd1-273a8dc9185b/files/da7881aa-5d41-4dbb-9c94-11f5fa5d5612.jpg";
const GROUP_IMG = "https://cdn.poehali.dev/projects/09ed16a7-04d1-460a-bcd1-273a8dc9185b/files/fc2a321f-fe50-465e-b970-0011cd3e0b28.jpg";
const SELFIE_IMG = "https://cdn.poehali.dev/projects/09ed16a7-04d1-460a-bcd1-273a8dc9185b/files/221277fd-81b0-4397-9c02-65732bfbbb8e.jpg";

const routes = [
  {
    id: 1,
    title: "Береговой путь",
    subtitle: "Вдоль Оби через старый город",
    distance: "18 км",
    duration: "3–4 часа",
    difficulty: "Лёгкий",
    points: 7,
    description: "Маршрут по набережной и историческому центру Сургута. Деревянные дома, виды на Обь, рыбацкие пристани. Идеально для первого знакомства с городом.",
    color: "bg-amber-50",
    price: 1800,
  },
  {
    id: 2,
    title: "Кедровый лес",
    subtitle: "Таёжная тропа за городом",
    distance: "26 км",
    duration: "4–5 часов",
    difficulty: "Средний",
    points: 9,
    description: "Уходим в пригородный лес по грунтовым дорогам. Болотные мостики, лесные поляны, смотровая вышка с панорамой на реку. Фотоостановки в самых живописных местах.",
    color: "bg-green-50",
    price: 1800,
  },
  {
    id: 3,
    title: "Большая петля",
    subtitle: "Полный обход окрестностей",
    distance: "42 км",
    duration: "6–7 часов",
    difficulty: "Насыщенный",
    points: 14,
    description: "Маршрут для тех, кто хочет увидеть всё: от промышленного наследия нефтяного края до нетронутой уральской природы. Пикник у озера включён.",
    color: "bg-orange-50",
    price: 2400,
  },
];

const reviews = [
  {
    name: "Татьяна М.",
    age: 54,
    text: "Никогда не думала, что смогу проехать 26 километров. Темп был такой, что я наслаждалась каждым километром. Открытки получились невероятные — дочка сразу распечатала и повесила на стену.",
    tour: "Кедровый лес",
  },
  {
    name: "Владимир К.",
    age: 61,
    text: "Маршрут продуман очень грамотно. Подсказки в приложении — чёткие, не заблудишься. Я открыл для себя места в Сургуте, о которых не знал, прожив здесь 30 лет.",
    tour: "Береговой путь",
  },
  {
    name: "Ирина и Сергей Д.",
    age: 48,
    text: "Поехали вдвоём на годовщину. Фототочки на маршруте — просто подарок. Видеоролик, который нам прислали после тура, смотрим снова и снова. Уже записались на Большую петлю.",
    tour: "Береговой путь",
  },
];

const faqs = [
  {
    q: "Нужен ли спортивный велосипед?",
    a: "Нет. Подходит любой комфортный велосипед с прямой посадкой. Если своего нет — мы поможем арендовать подходящий вариант в Сургуте.",
  },
  {
    q: "Какая физическая подготовка нужна?",
    a: "Никакой специальной. Туры рассчитаны на людей 40+, которые иногда катаются. Темп неспешный — вы сами выбираете, сколько времени провести на каждой остановке.",
  },
  {
    q: "Как работают фото-точки на маршруте?",
    a: "В приложении на телефоне вы получаете подсказки: куда ехать и что сфотографировать в каждой точке. Можно сделать селфи, пейзаж или фото деталей. После тура мы собираем всё в красивые открытки и видео.",
  },
  {
    q: "Едем группой или поодиночке?",
    a: "Маршрут каждый проезжает в своём темпе самостоятельно. Мы даём карту, подсказки и поддержку. Можно ехать соло, вдвоём или небольшой группой друзей.",
  },
  {
    q: "Что входит в стоимость?",
    a: "Детальная карта маршрута, подсказки в приложении, комплект открыток с вашими фото и видеоролик-воспоминание. Аренда велосипеда и перекус — по желанию, за дополнительную плату.",
  },
  {
    q: "Можно ли перенести дату?",
    a: "Да, за 48 часов до тура без штрафа. Мы понимаем, что погода в Сургуте непредсказуема.",
  },
];

export default function Index() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedRoute, setSelectedRoute] = useState(routes[0]);
  const [participants, setParticipants] = useState(2);
  const [date, setDate] = useState("");
  const [bookingDone, setBookingDone] = useState(false);

  const total = selectedRoute.price * participants;

  return (
    <div className="min-h-screen bg-background font-body">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/90 backdrop-blur-sm border-b border-border">
        <a href="#hero" className="font-display text-2xl font-semibold text-primary tracking-wide">
          ВелоСургут
        </a>
        <div className="hidden md:flex gap-8 text-sm font-medium text-foreground/70">
          <a href="#routes" className="hover:text-primary transition-colors">Маршруты</a>
          <a href="#booking" className="hover:text-primary transition-colors">Бронирование</a>
          <Link to="/reviews" className="hover:text-primary transition-colors">Отзывы</Link>
          <a href="#faq" className="hover:text-primary transition-colors">Вопросы</a>
        </div>
        <a
          href="#booking"
          className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          Записаться
        </a>
      </nav>

      {/* HERO */}
      <section id="hero" className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />

        <div className="relative z-10 px-6 md:px-16 pb-20 pt-32 max-w-4xl">
          <p className="text-accent font-body font-medium tracking-widest text-sm uppercase mb-4 animate-fade-in">
            Сургут и окрестности · с 2023 года
          </p>
          <h1 className="font-display text-6xl md:text-8xl font-semibold text-white leading-none mb-6 animate-slide-up delay-100">
            Велотуры<br />
            <em className="font-light">для тех,<br />кто смотрит</em>
          </h1>
          <p className="text-white/80 font-body text-lg md:text-xl max-w-xl mb-10 animate-slide-up delay-200">
            Не гонка, а путешествие. Едете в своём темпе, открываете скрытые места Сургута и возвращаетесь домой с красивыми открытками и видео о своём дне.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-300">
            <a
              href="#booking"
              className="inline-flex items-center gap-2 bg-accent text-foreground font-medium px-8 py-4 rounded hover:bg-accent/90 transition-colors text-base"
            >
              <Icon name="Bike" size={20} />
              Выбрать тур
            </a>
            <a
              href="#routes"
              className="inline-flex items-center gap-2 border border-white/40 text-white font-medium px-8 py-4 rounded hover:bg-white/10 transition-colors text-base"
            >
              Смотреть маршруты
              <Icon name="ArrowRight" size={18} />
            </a>
          </div>
        </div>

        <div className="relative z-10 bg-primary/95 backdrop-blur-sm px-6 md:px-16 py-5 flex flex-wrap gap-8">
          {[
            { icon: "MapPin", value: "3 маршрута", label: "в Сургуте и районе" },
            { icon: "Camera", value: "7–14 точек", label: "для фото на маршруте" },
            { icon: "Image", value: "Открытки + видео", label: "в подарок после тура" },
            { icon: "Users", value: "40+", label: "возраст участников" },
          ].map((s) => (
            <div key={s.value} className="flex items-center gap-3">
              <Icon name={s.icon} size={20} className="text-accent flex-shrink-0" />
              <div>
                <div className="text-white font-semibold text-sm">{s.value}</div>
                <div className="text-white/60 text-xs">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <p className="text-muted-foreground text-sm tracking-widest uppercase mb-3 font-body">Как это устроено</p>
        <h2 className="font-display text-5xl md:text-6xl font-semibold text-foreground mb-16 leading-tight">
          Простой маршрут —<br /><em className="font-light">незабываемый день</em>
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-10">
            {[
              { num: "01", icon: "Map", title: "Получаете карту и подсказки", text: "После бронирования вам приходит ссылка. В день тура открываете на телефоне — там весь маршрут с точками и подсказками, куда ехать и что смотреть." },
              { num: "02", icon: "Camera", title: "Едете и фотографируете", text: "У каждой точки — задание для фото. Селфи, пейзаж или интересная деталь. Никакого давления по времени — темп только ваш." },
              { num: "03", icon: "Gift", title: "Получаете открытки и видео", text: "На следующий день вам присылаем комплект открыток с вашими лучшими фото и короткий видеоролик-воспоминание о поездке." },
            ].map((step) => (
              <div key={step.num} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Icon name={step.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body tracking-widest uppercase mb-1">{step.num}</p>
                  <h3 className="font-display text-2xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground font-body leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative">
            <img
              src={GROUP_IMG}
              alt="Участники велотура"
              className="w-full h-[500px] object-cover rounded-lg shadow-2xl"
            />
            <img
              src={SELFIE_IMG}
              alt="Фото на маршруте"
              className="absolute -bottom-8 -left-8 w-48 h-48 object-cover rounded-lg shadow-xl border-4 border-background"
            />
          </div>
        </div>
      </section>

      {/* ROUTES */}
      <section id="routes" className="py-24 bg-muted/50">
        <div className="px-6 md:px-16 max-w-6xl mx-auto">
          <p className="text-muted-foreground text-sm tracking-widest uppercase mb-3 font-body">Маршруты</p>
          <h2 className="font-display text-5xl md:text-6xl font-semibold text-foreground mb-16 leading-tight">
            Три пути<br /><em className="font-light">по сургутской земле</em>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {routes.map((route, i) => (
              <div
                key={route.id}
                className={`${route.color} rounded-lg p-8 border border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="text-xs font-body font-medium text-muted-foreground tracking-widest uppercase bg-white/60 px-3 py-1 rounded-full">
                    {route.difficulty}
                  </span>
                  <span className="text-3xl font-display font-bold text-foreground/20">0{route.id}</span>
                </div>

                <h3 className="font-display text-3xl font-semibold text-foreground mb-1">{route.title}</h3>
                <p className="text-sm text-muted-foreground font-body mb-5">{route.subtitle}</p>
                <p className="text-foreground/80 font-body text-sm leading-relaxed mb-8">{route.description}</p>

                <div className="flex gap-4 text-sm font-body mb-2">
                  <div className="flex items-center gap-1.5 text-foreground/70">
                    <Icon name="Route" size={15} className="text-primary" />
                    {route.distance}
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground/70">
                    <Icon name="Clock" size={15} className="text-primary" />
                    {route.duration}
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground/70">
                    <Icon name="Camera" size={15} className="text-primary" />
                    {route.points} точек
                  </div>
                </div>

                <p className="text-lg font-display font-semibold text-primary mb-4">{route.price.toLocaleString("ru-RU")} ₽ / чел</p>

                <button
                  onClick={() => {
                    setSelectedRoute(route);
                    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full bg-primary text-primary-foreground font-body font-medium py-3 rounded text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  Забронировать
                  <Icon name="ArrowRight" size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="py-24 px-6 md:px-16 max-w-4xl mx-auto">
        <p className="text-muted-foreground text-sm tracking-widest uppercase mb-3 font-body">Онлайн-бронирование</p>
        <h2 className="font-display text-5xl md:text-6xl font-semibold text-foreground mb-4 leading-tight">
          Выберите тур<br /><em className="font-light">и дату</em>
        </h2>
        <p className="text-muted-foreground font-body mb-12">Маршруты доступны с мая по октябрь. Минимальная группа — 1 человек.</p>

        {!bookingDone ? (
          <div className="bg-card border border-border rounded-lg p-8 md:p-12 shadow-sm">
            <div className="mb-8">
              <label className="block text-sm font-medium font-body text-foreground mb-3">Маршрут</label>
              <div className="grid md:grid-cols-3 gap-3">
                {routes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoute(r)}
                    className={`p-4 rounded border text-left transition-all ${
                      selectedRoute.id === r.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    <div className="font-display text-xl font-semibold">{r.title}</div>
                    <div className="text-xs font-body text-muted-foreground mt-1">{r.distance} · {r.duration}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium font-body text-foreground mb-3">Дата тура</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full md:w-auto border border-border rounded px-4 py-3 font-body text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div className="mb-10">
              <label className="block text-sm font-medium font-body text-foreground mb-3">Количество участников</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setParticipants(Math.max(1, participants - 1))}
                  className="w-10 h-10 rounded-full border border-border hover:border-primary text-foreground hover:text-primary transition-colors flex items-center justify-center font-body text-lg"
                >
                  −
                </button>
                <span className="font-display text-4xl font-semibold text-foreground w-10 text-center">{participants}</span>
                <button
                  onClick={() => setParticipants(Math.min(12, participants + 1))}
                  className="w-10 h-10 rounded-full border border-border hover:border-primary text-foreground hover:text-primary transition-colors flex items-center justify-center font-body text-lg"
                >
                  +
                </button>
                <span className="text-muted-foreground font-body text-sm ml-2">человек (максимум 12)</span>
              </div>
            </div>

            <div className="bg-muted/60 rounded-lg p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-body text-sm text-muted-foreground">Итого за {participants} {participants === 1 ? "участника" : "участников"}</p>
                <p className="font-display text-4xl font-semibold text-foreground mt-1">
                  {total.toLocaleString("ru-RU")} ₽
                </p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  {selectedRoute.price.toLocaleString("ru-RU")} ₽ / чел · {selectedRoute.title} · {date || "дата не выбрана"}
                </p>
              </div>
              <div className="text-sm font-body text-muted-foreground space-y-1">
                <div className="flex items-center gap-2"><Icon name="Check" size={14} className="text-secondary" /> Карта маршрута</div>
                <div className="flex items-center gap-2"><Icon name="Check" size={14} className="text-secondary" /> Подсказки в приложении</div>
                <div className="flex items-center gap-2"><Icon name="Check" size={14} className="text-secondary" /> Открытки + видеоролик</div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!date) {
                  alert("Пожалуйста, выберите дату тура");
                  return;
                }
                setBookingDone(true);
              }}
              className="w-full bg-primary text-primary-foreground font-body font-medium py-4 rounded text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="Bike" size={20} />
              Забронировать за {total.toLocaleString("ru-RU")} ₽
            </button>
            <p className="text-center text-xs text-muted-foreground font-body mt-4">Оплата после подтверждения. Отмена бесплатно за 48 часов.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-12 text-center shadow-sm animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
              <Icon name="CheckCircle" size={32} className="text-secondary" />
            </div>
            <h3 className="font-display text-4xl font-semibold text-foreground mb-3">Заявка принята!</h3>
            <p className="text-muted-foreground font-body mb-2">
              <strong className="text-foreground">{selectedRoute.title}</strong> · {date} · {participants} {participants === 1 ? "участник" : "участников"}
            </p>
            <p className="text-muted-foreground font-body text-sm">Мы свяжемся с вами в течение 2 часов для подтверждения и оплаты.</p>
            <button
              onClick={() => setBookingDone(false)}
              className="mt-8 border border-border font-body text-sm text-foreground px-6 py-3 rounded hover:bg-muted transition-colors"
            >
              Новая заявка
            </button>
          </div>
        )}
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-24 bg-primary text-primary-foreground">
        <div className="px-6 md:px-16 max-w-6xl mx-auto">
          <p className="text-primary-foreground/50 text-sm tracking-widest uppercase mb-3 font-body">Отзывы</p>
          <h2 className="font-display text-5xl md:text-6xl font-semibold text-primary-foreground mb-16 leading-tight">
            Говорят<br /><em className="font-light">участники</em>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((r, i) => (
              <div key={i} className="border border-primary-foreground/20 rounded-lg p-8 hover:border-primary-foreground/40 transition-colors">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Icon key={j} name="Star" size={14} className="text-accent" />
                  ))}
                </div>
                <p className="font-body text-primary-foreground/80 leading-relaxed mb-8 text-sm">«{r.text}»</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body font-medium text-primary-foreground text-sm">{r.name}</p>
                    <p className="font-body text-primary-foreground/50 text-xs">{r.age} лет</p>
                  </div>
                  <span className="text-xs font-body text-primary-foreground/40 bg-primary-foreground/10 px-3 py-1 rounded-full">
                    {r.tour}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 md:px-16 max-w-3xl mx-auto">
        <p className="text-muted-foreground text-sm tracking-widest uppercase mb-3 font-body">Частые вопросы</p>
        <h2 className="font-display text-5xl md:text-6xl font-semibold text-foreground mb-16 leading-tight">
          Всё, что<br /><em className="font-light">хотели спросить</em>
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-body font-medium text-foreground pr-4">{faq.q}</span>
                <Icon
                  name={openFaq === i ? "Minus" : "Plus"}
                  size={18}
                  className="text-primary flex-shrink-0"
                />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6 text-muted-foreground font-body text-sm leading-relaxed animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-24 px-6 md:px-16 bg-muted/50 text-center">
        <p className="text-muted-foreground text-sm tracking-widest uppercase mb-4 font-body">Готовы в путь?</p>
        <h2 className="font-display text-5xl md:text-7xl font-semibold text-foreground mb-6 leading-tight">
          Сезон<br /><em className="font-light">открыт</em>
        </h2>
        <p className="text-muted-foreground font-body max-w-md mx-auto mb-10">
          Запишитесь на ближайший тур. Ближайшие даты расписаны быстро — особенно в сентябрь, когда лес золотой.
        </p>
        <a
          href="#booking"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-medium px-10 py-4 rounded hover:bg-primary/90 transition-colors text-base"
        >
          <Icon name="Bike" size={20} />
          Записаться на тур
        </a>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-primary-foreground/60 px-6 md:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-display text-2xl font-semibold text-primary-foreground">ВелоСургут</p>
        <p className="font-body text-sm">Велотуры по Сургуту и окрестностям · Сезон май–октябрь</p>
        <p className="font-body text-sm">© 2024 ВелоСургут</p>
      </footer>

    </div>
  );
}