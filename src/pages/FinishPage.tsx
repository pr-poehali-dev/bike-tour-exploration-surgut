import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const QUEST_API = "https://functions.poehali.dev/1e070259-58c4-4044-8acd-20a4cce1f7ec";

interface Photo {
  photo_url: string;
  caption: string | null;
  point_title: string;
  order_num: number;
  fun_fact: string;
}

interface Result {
  name: string;
  date: string;
  route_title: string;
  route_description: string;
  photos: Photo[];
}

export default function FinishPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`${QUEST_API}?action=result&session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setResult(data);
        // финализировать сессию
        fetch(`${QUEST_API}?action=finish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
      })
      .catch(() => setError("Не удалось загрузить результаты"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const downloadPostcard = async () => {
    if (!result || !cardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#2a1a0e",
      });
      const link = document.createElement("a");
      link.download = `велосургут-${result.name}-${result.date}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Не удалось создать открытку. Попробуйте сделать скриншот вручную.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Icon name="Loader" size={32} className="text-primary animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground font-body text-sm">Собираем твой маршрут...</p>
      </div>
    </div>
  );

  if (error || !result) return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center">
        <Icon name="AlertCircle" size={40} className="text-destructive mx-auto mb-4" />
        <p className="font-display text-2xl text-foreground mb-2">Что-то пошло не так</p>
        <p className="text-muted-foreground font-body text-sm mb-6">{error}</p>
        <Link to="/" className="text-primary font-body text-sm underline">На главную</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-body pb-16">
      {/* КОНФЕТТИ-ШАПКА */}
      <div className="bg-primary text-primary-foreground px-6 pt-16 pb-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none text-8xl flex flex-wrap gap-4 justify-center items-center">
          {["🚴", "🌲", "🏆", "⭐", "🗺️", "🎉"].map((e, i) => (
            <span key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
          ))}
        </div>
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-5">
            <Icon name="Trophy" size={36} className="text-accent-foreground" />
          </div>
          <p className="text-primary-foreground/70 text-sm uppercase tracking-widest mb-2 font-body">Маршрут пройден!</p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold leading-tight mb-3">
            {result.name}
          </h1>
          <p className="text-primary-foreground/70 font-body">
            {result.route_title} · {result.date} · {result.photos.length} точек
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-10">

        {/* ОТКРЫТКА ДЛЯ СКАЧИВАНИЯ */}
        <div
          ref={cardRef}
          className="rounded-xl overflow-hidden mb-8 relative"
          style={{ background: "linear-gradient(135deg, #2a1a0e 0%, #3d2510 50%, #1a2e1a 100%)" }}
        >
          {/* сетка фото */}
          <div className={`grid gap-0.5 ${result.photos.length === 1 ? "grid-cols-1" : result.photos.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
            {result.photos.map((ph, i) => (
              <div key={i} className="relative aspect-square overflow-hidden">
                <img
                  src={ph.photo_url}
                  alt={ph.point_title}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-body font-medium leading-tight line-clamp-1">{ph.point_title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* подвал открытки */}
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-white font-display text-2xl font-semibold">{result.name}</p>
              <p className="text-white/60 text-sm font-body">{result.route_title} · {result.date}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs font-body">ВелоСургут</p>
              <p className="text-white/40 text-xs font-body">velosurgut.ru</p>
            </div>
          </div>
        </div>

        {/* КНОПКА СКАЧАТЬ */}
        <button
          onClick={downloadPostcard}
          disabled={downloading}
          className="w-full bg-accent text-accent-foreground font-body font-semibold py-4 rounded text-base hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mb-3"
        >
          {downloading
            ? <><Icon name="Loader" size={18} className="animate-spin" /> Создаём открытку...</>
            : <><Icon name="Download" size={18} /> Скачать открытку для сторис</>
          }
        </button>

        <p className="text-center text-xs text-muted-foreground font-body mb-10">
          PNG-файл · идеально подходит для Instagram и ВКонтакте
        </p>

        {/* ФОТО ПО ТОЧКАМ */}
        <h2 className="font-display text-3xl font-semibold text-foreground mb-6">Твои точки</h2>
        <div className="space-y-6">
          {result.photos.map((ph, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="aspect-video overflow-hidden">
                <img src={ph.photo_url} alt={ph.point_title} className="w-full h-full object-cover" />
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary/10 text-primary text-xs font-body font-semibold px-2 py-0.5 rounded">
                    {ph.order_num}
                  </span>
                  <p className="font-body font-semibold text-foreground">{ph.point_title}</p>
                </div>
                {ph.caption && (
                  <p className="text-muted-foreground font-body text-sm italic mb-3">«{ph.caption}»</p>
                )}
                {ph.fun_fact && (
                  <div className="bg-muted/50 rounded px-3 py-2 flex gap-2">
                    <span className="text-sm">💡</span>
                    <p className="text-xs text-muted-foreground font-body leading-relaxed">{ph.fun_fact}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ФИНАЛ */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="font-display text-2xl font-semibold text-foreground mb-2">Ты прошёл маршрут!</p>
          <p className="text-muted-foreground font-body text-sm mb-6">Поделись своими впечатлениями — другим велосипедистам будет интересно</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/reviews"
              className="bg-primary text-primary-foreground font-body font-medium px-6 py-3 rounded hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Icon name="Star" size={16} /> Оставить отзыв
            </Link>
            <Link
              to="/route"
              className="bg-muted text-foreground font-body font-medium px-6 py-3 rounded hover:bg-muted/70 transition-colors flex items-center gap-2"
            >
              <Icon name="RotateCcw" size={16} /> Пройти снова
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
