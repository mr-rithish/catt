# CATT — VCE Student Attendance Portal (Frontend)

This repository contains the frontend for "CATT" (Client-side Attendance Tracker) — a Vite + React TypeScript single-page application that interacts with a backend scraper service to fetch VCE attendance data.

> Note: The project’s backend is maintained in a separate repository: https://github.com/mr-rithish/zatt/ (this repo may be private or separate for deployment). This repository also includes a reference implementation of the backend in `backend/` for convenience and local testing.

Key highlights
- Frontend: React + TypeScript, built with Vite. Tailwind CSS is configured in devDependencies.
- Backend (reference included here): a small FastAPI scraper which implements a two-step captcha login flow and parses attendance details. The actual production backend is in the separate repo (see above).

Live demo / Deployment
- Frontend: This project is configured for Vercel deployment (vercel.json is included). If you have the Vercel project URL, add it here. Example: https://your-site.vercel.app
- Backend: The real backend is hosted from the `mr-rithish/zatt` repository — I could not access that repository from this environment. If you have a deployment URL for the backend (e.g., on Heroku / Railway / Vercel / Fly / Render), add it here (for example: https://zatt.example.com).

Architecture
- Frontend (this repo)
  - Built with React + TypeScript
  - Vite dev server for local development
  - Communicates with the backend via REST endpoints (see API section)
- Backend (reference in `backend/` and canonical backend in `mr-rithish/zatt`)
  - FastAPI app providing three endpoints to implement a two-step login (captcha fetch + submit)
  - Scrapes the VCE ERP pages and extracts student and attendance tables

Quick start — Frontend (local)
1. Install dependencies

   npm install

2. Start the dev server

   npm run dev

3. Build for production

   npm run build

4. Preview the production build locally

   npm run preview

The package.json includes these scripts and uses Vite. Tailwind and PostCSS are included in devDependencies.

Backend — reference (included in this repo under `backend/`)
- The `backend/main.py` file implements a FastAPI app with the following endpoints:
  - GET /start_login
    - Starts a session with the ERP site, fetches the first captcha image and returns a session token and base64-encoded captcha image.
  - POST /complete_login
    - Accepts { session_token, htno, password, captcha } and completes the login flow, then fetches and parses the attendance popup page and returns parsed JSON for student info, overall summary, and subject summary.
  - GET /session_status/{token}
    - Returns whether the session token is still valid and how long until it expires.

- Requirements (backend/requirements.txt)
  - fastapi
  - uvicorn
  - requests
  - beautifulsoup4
  - pandas
  - lxml
  - slowapi

- Startup command (backend/startup.txt)
  - web: uvicorn main:app --host 0.0.0.0 --port 8000

Run the reference backend locally
1. (Optional) Create a virtualenv and activate it

   python -m venv .venv
   source .venv/bin/activate  # macOS / Linux
   .\.venv\Scripts\activate  # Windows

2. Install requirements

   pip install -r backend/requirements.txt

3. Run

   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

4. The API will be available at http://localhost:8000/

API Examples
- Start a login session (fetch captcha)

curl http://localhost:8000/start_login

Response (200)
{
  "session_token": "<uuid-token>",
  "captcha_image_base64": "<base64-jpeg/png>"
}

- Complete login

curl -X POST http://localhost:8000/complete_login \
  -H "Content-Type: application/json" \
  -d '{ "session_token": "<token>", "htno": "HTNO", "password": "PASS", "captcha": "ABCD" }'

Response (200)
{
  "student_info": { "Name": "...", "HTNo": "..." },
  "overall_summary": [ ... ],
  "subject_summary": [ ... ]
}

If credentials or captcha are invalid the endpoint returns 401 with a JSON body containing a new captcha image (base64) and the same session_token so the client can retry.

Security, ethics and usage notes
- This project scrapes the VCE ERP site to obtain attendance information. Make sure you have permission to use automated scraping on that site and follow the site’s terms of service.
- Do not store user credentials in logs or commit them to version control.
- The included backend keeps short-lived session state in memory; for production consider a more robust session store and rate limiting.

What I inspected
- package.json: confirmed React + Vite + Tailwind setup and dev scripts.
- backend/main.py: implemented the two-step captcha flow, scraping and parsing; endpoints documented above.
- backend/requirements.txt and backend/startup.txt: documented startup and dependencies.
- vercel.json present — project configured to deploy to Vercel (frontend)

Notes about the separate backend repo (mr-rithish/zatt)
- You told me the canonical backend lives at https://github.com/mr-rithish/zatt/
- I attempted to access that repository from this environment but it returned "Not found" — it may be private or the name may differ. If you want the README to contain exact deployment URLs, environment variables, or CI/CD details from that repo, please either:
  - Make the zatt repo public or
  - Share the deployment URL, or
  - Grant access / provide any README or deployment info you'd like included.

Contributing
- Open an issue or a PR describing the change.
- Frontend changes: follow the existing TypeScript + Vite conventions and run the linter before submitting.
- Backend changes: prefer type hints and keep scraping logic tested and robust to HTML changes.

License
- Add a LICENSE file to this repo if you want to open-source this project. If you want, I can add an MIT license file for you.

Contact
- Author: mr-rithish
- Repo: https://github.com/mr-rithish/catt
- Backend (canonical): https://github.com/mr-rithish/zatt/

---

If you want, I can:
- Add a short README banner, badges, or a Quick Start GIF/Screenshots.
- Try again to fetch the zatt repo if you make it public or give me the proper repo details.
