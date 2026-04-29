"""
Принимает заявку с сайта, сохраняет в БД и отправляет уведомление в Telegram.
Лид никогда не теряется — даже если Telegram недоступен.
"""

import json
import os
import re
import urllib.request
import urllib.error
import psycopg2


HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def validate_email(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email))


def send_telegram(token: str, chat_id: str, text: str) -> tuple[bool, str]:
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return True, ""
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return False, f"HTTP {e.code}: {body}"
    except Exception as e:
        return False, str(e)


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": HEADERS, "body": json.dumps({"error": "Method not allowed"})}

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "Invalid JSON"})}

    email = (body.get("email") or "").strip()
    if not email or not validate_email(email):
        return {"statusCode": 422, "headers": HEADERS, "body": json.dumps({"error": "Некорректный email"})}

    name = (body.get("name") or "").strip() or None
    phone = (body.get("phone") or "").strip() or None
    company = (body.get("company") or "").strip() or None
    task_type = body.get("task_type") or None
    if task_type not in ("pilot", "full_project", "audit", None):
        task_type = None
    message = (body.get("message") or "").strip() or None

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO leads (name, email, phone, company, task_type, message, tg_notified, tg_error)
        VALUES (%s, %s, %s, %s, %s, %s, FALSE, NULL)
        RETURNING id, created_at
        """,
        (name, email, phone, company, task_type, message),
    )
    row = cur.fetchone()
    lead_id = str(row[0])
    created_at = row[1].strftime("%d.%m.%Y %H:%M")
    conn.commit()

    tg_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    tg_chat = os.environ.get("TELEGRAM_CHAT_ID", "")

    tg_text = (
        f"🔔 <b>Новая заявка с сайта</b>\n\n"
        f"👤 Имя: {name or '—'}\n"
        f"📧 Email: {email}\n"
        f"📱 Телефон: {phone or '—'}\n"
        f"🏢 Компания: {company or '—'}\n"
        f"📋 Тип: {task_type or '—'}\n"
        f"💬 Сообщение: {message or '—'}\n\n"
        f"🕐 {created_at} | ID: {lead_id[:8]}"
    )

    tg_ok, tg_err = send_telegram(tg_token, tg_chat, tg_text)

    cur.execute(
        "UPDATE leads SET tg_notified = %s, tg_error = %s WHERE id = %s",
        (tg_ok, tg_err if not tg_ok else None, lead_id),
    )
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": HEADERS,
        "body": json.dumps({"ok": True, "id": lead_id, "tg_notified": tg_ok}),
    }
