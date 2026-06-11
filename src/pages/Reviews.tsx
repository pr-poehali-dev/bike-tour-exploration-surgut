import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/217b3352-2746-4b12-b6ec-3733cd3408ee";
const TOUR_ROUTES = ["Береговой путь", "Кедровый лес", "Большая петля"];

interface Review {
  id: number;
  name: string;
  age: number | null;
  tour: string;
  rating: number;
  text: string;
  date: string;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", age: "", tour: TOUR_ROUTES[0], rating: 5, text: "" });

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => setReviews(data))
      .catch(() => setError("Не удалось загрузить отзывы"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          age: form.age ? parseInt(form.age) : null,
          tour: form.tour,
          rating: form.rating,
          text: form.text.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      const newReview: Review = {
        id,
        name: form.name.trim(),
        age: form.age ? parseInt(form.age) : null,
        tour: form.tour,
        rating: form.rating,
        text: form.text.trim(),
        date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
      };
      setReviews((prev) => [newReview, ...prev]);
      setForm({ name: "", age: "", tour: TOUR_ROUTES[0], rating: 5, text: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      setError("Не удалось отправить отзыв. Попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/90 backdrop-blur-sm border-b border-border">
        <Link to="/" className="font-display text-2xl font-semibold text-primary tracking-wide">
          ВелоСургут
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-foreground/70">
          <Link to="/#routes" className="hover:text-primary transition-colors">Маршруты</Link>
          <Link to="/#booking" className="hover:text-primary transition-colors">Бронирование</Link>
          <Link to="/reviews" className="text-primary font-semibold">Отзывы</Link>
          <Link to="/#faq" className="hover:text-primary transition-colors">Вопросы</Link>
        </div>
        <Link
          to="/#booking"
          className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          Записаться
        </Link>
      </nav>

      {/* HEADER */}
      <section className="pt-32 pb-16 px-6 md:px-16 max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-body">
          <Icon name="ArrowLeft" size={16} />
          На главную
        </Link>
        <p className="text-muted-foreground text-sm tracking-widest uppercase mb-3 font-body">Отзывы участников</p>
        <h1 className="font-display text-5xl md:text-7xl font-semibold text-foreground leading-tight mb-4">
          Что говорят<br /><em className="font-light">о наших турах</em>
        </h1>
        <p className="text-muted-foreground font-body text-lg max-w-xl">
          Поделитесь своими впечатлениями после поездки.
        </p>
      </section>

      {/* FORM */}
      <section className="pb-16 px-6 md:px-16 max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 md:p-10 shadow-sm">
          <h2 className="font-display text-3xl font-semibold text-foreground mb-8">Оставить отзыв</h2>

          {submitted && (
            <div className="mb-6 flex items-center gap-3 bg-secondary/10 border border-secondary/30 text-foreground rounded-lg px-5 py-4 animate-fade-in">
              <Icon name="CheckCircle" size={20} className="text-secondary flex-shrink-0" />
              <span className="font-body text-sm">Спасибо! Ваш отзыв опубликован.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-5 py-4">
              <Icon name="AlertCircle" size={20} className="flex-shrink-0" />
              <span className="font-body text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium font-body text-foreground mb-2">Ваше имя *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Имя и первая буква фамилии"
                  required
                  className="w-full border border-border rounded px-4 py-3 font-body text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium font-body text-foreground mb-2">Возраст</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="Например, 52"
                  min={18}
                  max={99}
                  className="w-full border border-border rounded px-4 py-3 font-body text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium font-body text-foreground mb-2">Маршрут</label>
              <div className="grid grid-cols-3 gap-3">
                {TOUR_ROUTES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, tour: r })}
                    className={`p-3 rounded border text-sm font-body text-center transition-all ${
                      form.tour === r
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium font-body text-foreground mb-3">Оценка</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Icon
                      name="Star"
                      size={28}
                      className={star <= form.rating ? "text-accent" : "text-border"}
                    />
                  </button>
                ))}
                <span className="ml-2 self-center text-sm text-muted-foreground font-body">
                  {["", "Плохо", "Не очень", "Нормально", "Хорошо", "Отлично!"][form.rating]}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium font-body text-foreground mb-2">Ваш отзыв *</label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Расскажите о своих впечатлениях — что понравилось, что запомнилось, порекомендуете ли друзьям?"
                required
                rows={5}
                className="w-full border border-border rounded px-4 py-3 font-body text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-primary text-primary-foreground font-body font-medium py-4 rounded text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? (
                <><Icon name="Loader" size={18} className="animate-spin" /> Отправляем...</>
              ) : (
                <><Icon name="Send" size={18} /> Опубликовать отзыв</>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* REVIEWS LIST */}
      <section className="pb-24 px-6 md:px-16 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <Icon name="Loader" size={28} className="text-muted-foreground animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground font-body text-sm">Загружаем отзывы...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Icon name="MessageSquare" size={24} className="text-muted-foreground" />
            </div>
            <p className="font-display text-2xl font-semibold text-foreground mb-2">Пока нет отзывов</p>
            <p className="text-muted-foreground font-body text-sm">Будьте первым, кто поделится впечатлениями!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-semibold text-foreground mb-6">
              {reviews.length} {reviews.length === 1 ? "отзыв" : reviews.length < 5 ? "отзыва" : "отзывов"}
            </h2>
            {reviews.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-lg p-8 animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-body font-semibold text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">
                      {r.age ? `${r.age} лет · ` : ""}{r.tour} · {r.date}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Icon key={s} name="Star" size={14} className={s <= r.rating ? "text-accent" : "text-border"} />
                    ))}
                  </div>
                </div>
                <p className="font-body text-foreground/80 leading-relaxed text-sm">«{r.text}»</p>
              </div>
            ))}
          </div>
        )}
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
