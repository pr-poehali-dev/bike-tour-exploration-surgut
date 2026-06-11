import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const QUEST_API = "https://functions.poehali.dev/1e070259-58c4-4044-8acd-20a4cce1f7ec";

interface PointData {
  id: number;
  order_num: number;
  total: number;
  title: string;
  hint: string;
  description: string;
  fun_fact: string;
  already_done: boolean;
  photo_url: string | null;
  caption: string | null;
}

export default function PointPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get("session") || localStorage.getItem("quest_session") || "";

  const [point, setPoint] = useState<PointData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState<"story" | "photo">("story");
  const [caption, setCaption] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [done, setDone] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${QUEST_API}?action=point&id=${id}&session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setPoint(data);
        if (data.already_done) {
          setDone(true);
          setPhotoPreview(data.photo_url);
          setCaption(data.caption || "");
        }
      })
      .catch(() => setError("Не удалось загрузить точку"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFile = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setTab("photo");
  };

  const handleUpload = async () => {
    if (!photoFile || !sessionId) return;
    setUploading(true);
    setUploadError("");
    try {
      const reader = new FileReader();
      const b64 = await new Promise<string>((res, rej) => {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          res(result.split(",")[1]);
        };
        reader.onerror = rej;
        reader.readAsDataURL(photoFile);
      });
      const resp = await fetch(`${QUEST_API}?action=photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          point_id: point?.id,
          photo_b64: b64,
          caption,
          mime: photoFile.type || "image/jpeg",
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      setDone(true);
      if (data.finished) setAllDone(true);
    } catch {
      setUploadError("Не удалось загрузить фото. Попробуйте ещё раз.");
    } finally {
      setUploading(false);
    }
  };

  const nextPoint = () => {
    if (!point) return;
    if (allDone) {
      navigate(`/finish/${sessionId}`);
    } else {
      // просто показываем подсказку — следующая точка открывается через QR
      navigate(`/route`);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Icon name="Loader" size={32} className="text-primary animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground font-body text-sm">Загружаем точку...</p>
      </div>
    </div>
  );

  if (error || !point) return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center">
        <Icon name="AlertCircle" size={40} className="text-destructive mx-auto mb-4" />
        <p className="font-display text-2xl text-foreground mb-2">Точка не найдена</p>
        <p className="text-muted-foreground font-body text-sm mb-6">{error}</p>
        <Link to="/" className="text-primary font-body text-sm underline">На главную</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-body">
      {/* HEADER */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/route" className="flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors">
              <Icon name="ArrowLeft" size={14} /> Маршрут
            </Link>
            <span className="text-primary-foreground/70 text-sm font-body">
              {point.order_num} / {point.total}
            </span>
          </div>

          {/* прогресс */}
          <div className="flex gap-1.5 mb-6">
            {Array.from({ length: point.total }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${i < point.order_num ? "bg-primary-foreground" : "bg-primary-foreground/25"}`}
              />
            ))}
          </div>

          <p className="text-primary-foreground/70 text-sm uppercase tracking-widest mb-2 font-body">Точка {point.order_num}</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">{point.title}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* ТАБЫ */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 mb-8">
          {(["story", "photo"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded text-sm font-body font-medium transition-all flex items-center justify-center gap-2 ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon name={t === "story" ? "BookOpen" : "Camera"} size={15} />
              {t === "story" ? "История" : "Моё фото"}
            </button>
          ))}
        </div>

        {/* ——— ИСТОРИЯ ——— */}
        {tab === "story" && (
          <div className="animate-fade-in space-y-6">
            <p className="font-body text-foreground leading-relaxed text-base">{point.description}</p>

            {point.fun_fact && (
              <div className="bg-accent/15 border border-accent/30 rounded-lg px-5 py-4 flex gap-3">
                <span className="text-xl flex-shrink-0">💡</span>
                <div>
                  <p className="text-xs font-medium text-accent-foreground/70 uppercase tracking-wide mb-1 font-body">Интересный факт</p>
                  <p className="text-sm font-body text-foreground leading-relaxed">{point.fun_fact}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setTab("photo")}
              className="w-full bg-primary text-primary-foreground font-body font-semibold py-4 rounded text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="Camera" size={18} />
              {done ? "Посмотреть моё фото" : "Сделать фото здесь"}
            </button>
          </div>
        )}

        {/* ——— ФОТО ——— */}
        {tab === "photo" && (
          <div className="animate-fade-in space-y-5">
            {/* зона фото */}
            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                <img src={photoPreview} alt="фото" className="w-full h-full object-cover" />
                {!done && (
                  <button
                    onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <Icon name="X" size={14} className="text-white" />
                  </button>
                )}
                {done && (
                  <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-body font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <Icon name="CheckCircle" size={12} /> Сохранено
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-[4/3] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/3 transition-all text-muted-foreground"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Icon name="Camera" size={28} className="text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-body font-medium text-foreground text-sm">Нажми, чтобы выбрать фото</p>
                  <p className="text-xs mt-1">Или сделай прямо сейчас с камеры</p>
                </div>
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />

            {/* подпись */}
            {!done && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 font-body">Подпись (необязательно)</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Что ты чувствуешь здесь?"
                  className="w-full border border-border rounded px-4 py-3 font-body text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            )}

            {done && point.caption && (
              <div className="bg-card border border-border rounded-lg px-4 py-3">
                <p className="text-xs text-muted-foreground font-body mb-1">Твоя подпись</p>
                <p className="font-body text-foreground italic">«{point.caption}»</p>
              </div>
            )}

            {uploadError && (
              <div className="flex items-center gap-2 text-destructive text-sm font-body">
                <Icon name="AlertCircle" size={15} /> {uploadError}
              </div>
            )}

            {!done ? (
              <button
                onClick={handleUpload}
                disabled={!photoFile || uploading}
                className="w-full bg-primary text-primary-foreground font-body font-semibold py-4 rounded text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {uploading
                  ? <><Icon name="Loader" size={18} className="animate-spin" /> Сохраняем...</>
                  : <><Icon name="Upload" size={18} /> Сохранить фото</>
                }
              </button>
            ) : (
              <button
                onClick={nextPoint}
                className="w-full bg-secondary text-secondary-foreground font-body font-semibold py-4 rounded text-base hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
              >
                {allDone
                  ? <><Icon name="Trophy" size={18} /> Посмотреть итоги маршрута!</>
                  : <><Icon name="MapPin" size={18} /> К следующей точке</>
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
