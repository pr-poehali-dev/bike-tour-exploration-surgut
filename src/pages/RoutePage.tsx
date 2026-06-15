import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const QUEST_API = "https://functions.poehali.dev/1e070259-58c4-4044-8acd-20a4cce1f7ec";

interface Point {
  id: number;
  order_num: number;
  title: string;
  hint: string;
}

interface SavedSession {
  sessionId: string;
  name: string;
  doneCount: number;
  totalCount: number;
  nextPointId: number | null;
}

export default function RoutePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ points: Point[]; route: { title: string; description: string } } | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [saved, setSaved] = useState<SavedSession | null>(null);

  // при загрузке — проверить localStorage
  useEffect(() => {
    const sid = localStorage.getItem("quest_session");
    const sname = localStorage.getItem("quest_name");
    if (!sid || !sname) { setRestoring(false); return; }

    // загружаем прогресс из БД
    fetch(`${QUEST_API}?action=result&session_id=${sid}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          localStorage.removeItem("quest_session");
          localStorage.removeItem("quest_name");
          return;
        }
        const doneNums = new Set<number>(data.photos.map((p: { order_num: number }) => p.order_num));
        const total = parseInt(localStorage.getItem("quest_total") || "7");
        // найти первую незакрытую точку (id хранится в quest_points_map)
        const mapRaw = localStorage.getItem("quest_points_map");
        const pointsMap: { id: number; order_num: number }[] = mapRaw ? JSON.parse(mapRaw) : [];
        const nextPoint = pointsMap.find((p) => !doneNums.has(p.order_num));
        setSaved({
          sessionId: sid,
          name: sname,
          doneCount: doneNums.size,
          totalCount: total,
          nextPointId: nextPoint?.id ?? null,
        });
      })
      .catch(() => {})
      .finally(() => setRestoring(false));
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${QUEST_API}?action=start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), route_slug: "surgut-river" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview({ points: data.points, route: data.route });
      setSessionId(data.session_id);
      localStorage.setItem("quest_session", data.session_id);
      localStorage.setItem("quest_name", data.name);
      localStorage.setItem("quest_total", String(data.points.length));
      localStorage.setItem("quest_points_map", JSON.stringify(
        data.points.map((p: Point) => ({ id: p.id, order_num: p.order_num }))
      ));
    } catch {
      setError("Не удалось начать маршрут. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const goToFirst = () => {
    if (preview) navigate(`/point/${preview.points[0].id}?session=${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/90 backdrop-blur-sm border-b border-border">
        <Link to="/" className="font-display text-2xl font-semibold text-primary tracking-wide">ВелоСургут</Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <Icon name="ArrowLeft" size={14} /> На главную
        </Link>
      </nav>

      {!preview ? (
        /* ——— СТАРТ ——— */
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12">
          <div className="w-full max-w-md animate-fade-in">

            {/* БАННЕР ВОССТАНОВЛЕНИЯ */}
            {restoring ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-body mb-8">
                <Icon name="Loader" size={16} className="animate-spin" /> Проверяем прогресс...
              </div>
            ) : saved ? (
              <div className="bg-secondary/10 border border-secondary/30 rounded-xl px-5 py-5 mb-8 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="RotateCcw" size={18} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground text-sm mb-0.5">Незавершённый маршрут</p>
                    <p className="text-xs text-muted-foreground font-body">
                      {saved.name} · пройдено {saved.doneCount} из {saved.totalCount} точек
                    </p>
                    <div className="flex gap-1.5 mt-2 mb-3">
                      {Array.from({ length: saved.totalCount }, (_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i < saved.doneCount ? "bg-secondary" : "bg-border"}`} />
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          if (saved.doneCount >= saved.totalCount) {
                            navigate(`/finish/${saved.sessionId}`);
                          } else if (saved.nextPointId) {
                            navigate(`/point/${saved.nextPointId}?session=${saved.sessionId}`);
                          }
                        }}
                        className="bg-secondary text-secondary-foreground font-body font-medium text-sm px-4 py-2 rounded hover:bg-secondary/90 transition-colors flex items-center gap-1.5"
                      >
                        {saved.doneCount >= saved.totalCount
                          ? <><Icon name="Trophy" size={14} /> Посмотреть итоги</>
                          : <><Icon name="Play" size={14} /> Продолжить</>
                        }
                      </button>
                      <button
                        onClick={() => {
                          localStorage.removeItem("quest_session");
                          localStorage.removeItem("quest_name");
                          localStorage.removeItem("quest_total");
                          localStorage.removeItem("quest_points_map");
                          setSaved(null);
                        }}
                        className="text-muted-foreground font-body text-sm px-3 py-2 hover:text-foreground transition-colors"
                      >
                        Начать заново
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* иконка */}
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <Icon name="MapPin" size={36} className="text-primary" />
            </div>
            <h1 className="font-display text-5xl font-semibold text-foreground text-center mb-3 leading-tight">
              Береговой путь
            </h1>
            <p className="text-muted-foreground text-center font-body mb-2">7 точек · ~3 часа · велосипед</p>
            <p className="text-center text-sm text-muted-foreground font-body mb-10 max-w-sm mx-auto">
              Квест вдоль берега Оби. Найди каждую точку, отсканируй QR‑код, сделай фото — и получи личную страницу маршрута.
            </p>

            {/* шаги */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: "Navigation", label: "Едь по подсказкам" },
                { icon: "QrCode", label: "Сканируй QR на точке" },
                { icon: "Camera", label: "Фото + подпись" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                    <Icon name={s.icon as "Navigation"} size={20} className="text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground font-body leading-snug">{s.label}</p>
                </div>
              ))}
            </div>

            {!saved && (
              <form onSubmit={handleStart} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 font-body">Как тебя зовут?</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введи своё имя"
                    required
                    autoFocus
                    className="w-full border border-border rounded px-4 py-3 font-body text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-lg"
                  />
                </div>
                {error && <p className="text-destructive text-sm font-body">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="w-full bg-primary text-primary-foreground font-body font-semibold py-4 rounded text-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <><Icon name="Loader" size={20} className="animate-spin" /> Загружаем...</> : <><Icon name="Play" size={20} /> Начать маршрут</>}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* ——— СПИСОК ТОЧЕК ——— */
        <div className="min-h-screen pt-24 pb-16 px-6 max-w-2xl mx-auto animate-slide-up">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={28} className="text-secondary" />
            </div>
            <h2 className="font-display text-4xl font-semibold text-foreground mb-2">
              Привет, {localStorage.getItem("quest_name")}!
            </h2>
            <p className="text-muted-foreground font-body">{preview.route.description}</p>
          </div>

          <div className="space-y-3 mb-8">
            {preview.points.map((pt, i) => (
              <div
                key={pt.id}
                className="flex items-center gap-4 bg-card border border-border rounded-lg px-5 py-4"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-semibold text-primary text-sm">{pt.order_num}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-foreground text-sm">{pt.title}</p>
                  <p className="text-xs text-muted-foreground font-body truncate">{pt.hint}</p>
                </div>
                <Icon name="Lock" size={14} className="text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>

          <button
            onClick={goToFirst}
            className="w-full bg-primary text-primary-foreground font-body font-semibold py-4 rounded text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="Navigation" size={20} /> Поехали к первой точке!
          </button>
          <p className="text-center text-xs text-muted-foreground font-body mt-4">
            Точки открываются по порядку через QR‑коды
          </p>
        </div>
      )}
    </div>
  );
}