import uuid
import base64
import re
import time
import threading
from io import StringIO
import pandas as pd
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="VCE Attendance Scraper (two-step captcha flow)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

IN_MEMORY_SESSIONS = {}
BASE_URL = "https://erp.vce.ac.in/sinfo/"
LOGIN_URL = BASE_URL + "Default.aspx"
DASH_URL  = BASE_URL + "DashBoard.aspx"

class StartResp(BaseModel):
    session_token: str
    captcha_image_base64: str

class CompleteLogin(BaseModel):
    session_token: str
    htno: str
    password: str
    captcha: str

def validate_session(token: str) -> dict:
    info = IN_MEMORY_SESSIONS.get(token)
    if not info:
        raise HTTPException(status_code=400, detail="Session token not found")
    if time.time() > info["expires_at"]:
        IN_MEMORY_SESSIONS.pop(token, None)
        raise HTTPException(status_code=400, detail="Session token expired")
    return info

def cleanup_session(token: str):
    try:
        info = IN_MEMORY_SESSIONS.get(token)
        if info and "session" in info:
            info["session"].close()
    except:
        pass
    finally:
        IN_MEMORY_SESSIONS.pop(token, None)

def cleanup_expired_sessions():
    while True:
        try:
            current_time = time.time()
            expired_tokens = [
                token for token, info in IN_MEMORY_SESSIONS.items()
                if current_time > info["expires_at"]
            ]
            for token in expired_tokens:
                cleanup_session(token)
        except Exception:
            pass
        time.sleep(60)

threading.Thread(target=cleanup_expired_sessions, daemon=True).start()

@app.get("/start_login", response_model=StartResp)
def start_login():
    s = requests.Session()
    r = s.get(LOGIN_URL, timeout=10)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    try:
        viewstate       = soup.find("input", {"id": "__VIEWSTATE"})["value"]
        viewstategen    = soup.find("input", {"id": "__VIEWSTATEGENERATOR"})["value"]
        eventvalidation = soup.find("input", {"id": "__EVENTVALIDATION"})["value"]
    except Exception:
        raise HTTPException(status_code=500, detail="Login hidden fields not found")

    img_resp = s.get(BASE_URL + "CaptchaImage.aspx", timeout=10)
    img_resp.raise_for_status()
    img_b64 = base64.b64encode(img_resp.content).decode("ascii")

    token = str(uuid.uuid4())
    IN_MEMORY_SESSIONS[token] = {
        "session": s,
        "viewstate": viewstate,
        "viewstategen": viewstategen,
        "eventvalidation": eventvalidation,
        "created_at": time.time(),
        "expires_at": time.time() + 300
    }

    return {"session_token": token, "captcha_image_base64": img_b64}

def parse_attendance_popup(html: str):
    soup = BeautifulSoup(html, "html.parser")

    df_overall, df_subject = None, None

    sub_summary_table = soup.find("table", {"id": "TblDispAttSubSummary"})
    if sub_summary_table:
        inner = sub_summary_table.find("table", {"class": "tableclass"})
        if inner:
            try:
                df_overall = pd.read_html(StringIO(str(inner)))[0]
            except Exception:
                df_overall = None

    att_summary_table = soup.find("table", {"id": "TblDispAttSummary"})
    if att_summary_table:
        inner = att_summary_table.find("table", {"class": "tableclass"})
        if inner:
            try:
                df_subject = pd.read_html(StringIO(str(inner)))[0]
            except Exception:
                df_subject = None

    student_data = {}
    stu_table_outer = soup.find("table", {"id": "TblStuInfo"})
    if stu_table_outer:
        inner = stu_table_outer.find("table")
        if inner:
            for tr in inner.find_all("tr"):
                tds = [td for td in tr.find_all("td") if not td.find("img")]
                for i in range(0, len(tds), 3):
                    if i + 2 < len(tds):
                        key = tds[i].get_text(strip=True)
                        val = tds[i + 2].get_text(strip=True)
                        student_data[key] = val

    return {
        "student_info": student_data,
        "overall_summary": df_overall.to_dict(orient="records") if df_overall is not None else [],
        "subject_summary": df_subject.to_dict(orient="records") if df_subject is not None else []
    }

@app.post("/complete_login")
def complete_login(payload: CompleteLogin):
    try:
        info = validate_session(payload.session_token)
        s = info["session"]

        login_payload = {
            "__VIEWSTATE": info["viewstate"],
            "__VIEWSTATEGENERATOR": info["viewstategen"],
            "__EVENTVALIDATION": info["eventvalidation"],
            "txt_HTNO": payload.htno,
            "txt_Password": payload.password,
            "txtCaptcha": payload.captcha,
            "btn_Login": "Sign in"
        }

        r = s.post(LOGIN_URL, data=login_payload, timeout=10)
        r.raise_for_status()

        if "Invalid" in r.text or "Invalid Captcha" in r.text or "incorrect" in r.text.lower():
            # ✅ Session is still alive — just re-fetch a new captcha and return it
            # No cleanup — same session token stays valid for retry
            try:
                img_resp = s.get(BASE_URL + "CaptchaImage.aspx", timeout=10)
                img_resp.raise_for_status()
                new_captcha_b64 = base64.b64encode(img_resp.content).decode("ascii")
            except Exception:
                # Captcha re-fetch failed — force full reset
                cleanup_session(payload.session_token)
                return JSONResponse(status_code=401, content={
                    "detail": "Invalid credentials or captcha",
                    "new_captcha": None,
                    "session_token": None
                })

            return JSONResponse(status_code=401, content={
                "detail": "Invalid credentials or captcha",
                "new_captcha": new_captcha_b64,
                "session_token": payload.session_token  # same token, still valid
            })

        # -------- fetch dashboard --------
        dash = s.get(DASH_URL, timeout=10)
        dash.raise_for_status()
        soup = BeautifulSoup(dash.text, "html.parser")

        att_div = soup.find("div", {"id": "divAttSummary"})
        popup_url = None
        if att_div:
            for a in att_div.find_all("a", onclick=True):
                m = re.search(r"popUp\('([^']+)'", a["onclick"])
                if m:
                    popup_url = m.group(1)
                    break

        if not popup_url:
            cleanup_session(payload.session_token)
            raise HTTPException(status_code=404, detail="Attendance popup link not found")

        popup_r = s.get(BASE_URL + popup_url, timeout=10)
        popup_r.raise_for_status()

        parsed = parse_attendance_popup(popup_r.text)

        cleanup_session(payload.session_token)
        return JSONResponse(content=parsed)

    except HTTPException:
        raise
    except Exception as e:
        cleanup_session(payload.session_token)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/session_status/{token}")
def session_status(token: str):
    try:
        info = validate_session(token)
        return {"valid": True, "expires_in": int(info["expires_at"] - time.time())}
    except HTTPException as e:
        return {"valid": False, "error": e.detail}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)