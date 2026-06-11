import json
import os
import psycopg2
import psycopg2.extras

SCHEMA = "t_p66532775_bike_tour_exploratio"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """Получение и сохранение отзывов велотуров."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name, age, tour, rating, text, created_at FROM %s.reviews ORDER BY created_at DESC" % SCHEMA
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        reviews = [
            {
                "id": r[0],
                "name": r[1],
                "age": r[2],
                "tour": r[3],
                "rating": r[4],
                "text": r[5],
                "date": r[6].strftime("%d.%m.%Y"),
            }
            for r in rows
        ]
        return {"statusCode": 200, "headers": cors, "body": json.dumps(reviews, ensure_ascii=False)}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        name = (body.get("name") or "").strip()
        text = (body.get("text") or "").strip()
        tour = (body.get("tour") or "").strip()
        rating = int(body.get("rating") or 5)
        age = body.get("age")

        if not name or not text or not tour:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Заполните обязательные поля"})}

        if not (1 <= rating <= 5):
            rating = 5

        age_val = int(age) if age else None

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO %s.reviews (name, age, tour, rating, text) VALUES (%%s, %%s, %%s, %%s, %%s) RETURNING id" % SCHEMA,
            (name, age_val, tour, rating, text),
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return {"statusCode": 201, "headers": cors, "body": json.dumps({"id": new_id}, ensure_ascii=False)}

    return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "Method not allowed"})}
