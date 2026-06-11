"""
Квест-маршрут: старт сессии, получение точки, загрузка фото, финиш, результат.
Роутинг через ?action=start|point|photo|finish|result
"""
import json
import os
import uuid
import base64
import psycopg2
import boto3

SCHEMA = "t_p66532775_bike_tour_exploratio"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

def cdn_url(key):
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

def ok(data):
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False, default=str)}

def err(code, msg):
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg}, ensure_ascii=False)}

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")

    # GET ?action=point&id=3&session_id=...
    if method == "GET" and action == "point":
        point_id = qs.get("id")
        session_id = qs.get("session_id", "")
        if not point_id:
            return err(400, "id обязателен")
        conn = db()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, order_num, title, hint, description, fun_fact, route_id FROM {SCHEMA}.points WHERE id = %s",
            (point_id,)
        )
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return err(404, "Точка не найдена")
        pid, order_num, title, hint, description, fun_fact, route_id = row
        photo_url = caption = None
        if session_id:
            cur.execute(
                f"SELECT photo_url, caption FROM {SCHEMA}.photos WHERE session_id = %s AND point_id = %s LIMIT 1",
                (session_id, pid)
            )
            ph = cur.fetchone()
            if ph:
                photo_url, caption = ph
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.points WHERE route_id = %s", (route_id,))
        total = cur.fetchone()[0]
        cur.close(); conn.close()
        return ok({
            "id": pid, "order_num": order_num, "total": total,
            "title": title, "hint": hint, "description": description, "fun_fact": fun_fact,
            "already_done": photo_url is not None,
            "photo_url": photo_url, "caption": caption,
        })

    # GET ?action=result&session_id=...
    if method == "GET" and action == "result":
        session_id = qs.get("session_id", "")
        if not session_id:
            return err(400, "session_id обязателен")
        conn = db()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT s.name, s.created_at, r.title, r.description
                FROM {SCHEMA}.sessions s JOIN {SCHEMA}.routes r ON r.id = s.route_id
                WHERE s.id = %s""",
            (session_id,)
        )
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return err(404, "Сессия не найдена")
        name, created_at, route_title, route_desc = row
        cur.execute(
            f"""SELECT ph.photo_url, ph.caption, pt.title, pt.order_num, pt.fun_fact
                FROM {SCHEMA}.photos ph JOIN {SCHEMA}.points pt ON pt.id = ph.point_id
                WHERE ph.session_id = %s ORDER BY pt.order_num""",
            (session_id,)
        )
        photos = [
            {"photo_url": r[0], "caption": r[1], "point_title": r[2], "order_num": r[3], "fun_fact": r[4]}
            for r in cur.fetchall()
        ]
        cur.close(); conn.close()
        return ok({
            "name": name,
            "date": created_at.strftime("%d.%m.%Y"),
            "route_title": route_title,
            "route_description": route_desc,
            "photos": photos,
        })

    # POST ?action=start  body: {name, route_slug}
    if method == "POST" and action == "start":
        body = json.loads(event.get("body") or "{}")
        name = (body.get("name") or "Турист").strip() or "Турист"
        slug = body.get("route_slug", "surgut-river")
        conn = db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, title, description FROM {SCHEMA}.routes WHERE slug = %s", (slug,))
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return err(404, "Маршрут не найден")
        route_id, route_title, route_desc = row
        session_id = str(uuid.uuid4())
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (id, name, route_id) VALUES (%s, %s, %s)",
            (session_id, name, route_id)
        )
        conn.commit()
        cur.execute(
            f"SELECT id, order_num, title, hint FROM {SCHEMA}.points WHERE route_id = %s ORDER BY order_num",
            (route_id,)
        )
        points = [{"id": p[0], "order_num": p[1], "title": p[2], "hint": p[3]} for p in cur.fetchall()]
        cur.close(); conn.close()
        return ok({
            "session_id": session_id,
            "name": name,
            "route": {"id": route_id, "title": route_title, "description": route_desc},
            "points": points,
        })

    # POST ?action=photo  body: {session_id, point_id, photo_b64, caption, mime}
    if method == "POST" and action == "photo":
        body = json.loads(event.get("body") or "{}")
        session_id = body.get("session_id", "")
        point_id = body.get("point_id")
        photo_b64 = body.get("photo_b64", "")
        caption = (body.get("caption") or "").strip()
        mime = body.get("mime", "image/jpeg")
        ext = "jpg" if "jpeg" in mime else mime.split("/")[-1]

        if not session_id or not point_id or not photo_b64:
            return err(400, "Не хватает данных")

        conn = db()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.sessions WHERE id = %s", (session_id,))
        if not cur.fetchone():
            cur.close(); conn.close()
            return err(403, "Сессия не найдена")

        data = base64.b64decode(photo_b64)
        key = f"quest/{session_id}/{point_id}.{ext}"
        s3().put_object(Bucket="files", Key=key, Body=data, ContentType=mime)
        url = cdn_url(key)

        cur.execute(
            f"DELETE FROM {SCHEMA}.photos WHERE session_id = %s AND point_id = %s",
            (session_id, point_id)
        )
        cur.execute(
            f"INSERT INTO {SCHEMA}.photos (session_id, point_id, photo_url, caption) VALUES (%s, %s, %s, %s)",
            (session_id, point_id, url, caption)
        )
        conn.commit()

        cur.execute(
            f"SELECT COUNT(DISTINCT point_id) FROM {SCHEMA}.photos WHERE session_id = %s",
            (session_id,)
        )
        done = cur.fetchone()[0]
        cur.execute(
            f"SELECT COUNT(*) FROM {SCHEMA}.points WHERE route_id = (SELECT route_id FROM {SCHEMA}.sessions WHERE id = %s)",
            (session_id,)
        )
        total = cur.fetchone()[0]
        cur.close(); conn.close()
        return ok({"photo_url": url, "done": done, "total": total, "finished": done >= total})

    # POST ?action=finish  body: {session_id}
    if method == "POST" and action == "finish":
        body = json.loads(event.get("body") or "{}")
        session_id = body.get("session_id", "")
        conn = db()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.sessions SET finished = TRUE WHERE id = %s", (session_id,))
        conn.commit()
        cur.close(); conn.close()
        return ok({"ok": True})

    return err(404, "Неизвестный action")
