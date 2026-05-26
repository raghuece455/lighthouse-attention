# Setup Guide

Complete installation instructions for macOS, Linux, Windows, and Docker.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Clone the Repository](#clone-the-repository)
- [Option A — Local Development (Two Terminals)](#option-a--local-development-two-terminals)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Option B — Docker Compose](#option-b--docker-compose)
- [Verifying the Setup](#verifying-the-setup)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Stopping the Services](#stopping-the-services)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Minimum version | How to check | Where to get |
|---|---|---|---|
| Python | 3.10 | `python --version` | [python.org](https://www.python.org/downloads/) |
| pip | 23 | `pip --version` | bundled with Python |
| Node.js | 20 | `node --version` | [nodejs.org](https://nodejs.org/) |
| npm | 9 | `npm --version` | bundled with Node.js |
| Git | 2.x | `git --version` | [git-scm.com](https://git-scm.com/) |
| Docker Desktop | any | `docker --version` | [docker.com](https://www.docker.com/products/docker-desktop/) *(optional)* |

> The project does not download AI models and does not call any external APIs. Everything runs locally.

---

## Clone the Repository

```bash
git clone https://github.com/raghuece455/lighthouse-attention.git
cd lighthouse-attention
```

After cloning your directory structure looks like this:

```
lighthouse-attention/
├── backend/         ← FastAPI + Python
├── frontend/        ← React + TypeScript + Vite
├── docs/
├── scripts/
├── docker-compose.yml
└── README.md
```

---

## Option A — Local Development (Two Terminals)

Open two separate terminal windows or tabs.

### Backend Setup

**macOS / Linux:**

```bash
cd lighthouse-attention/backend

# Create a virtual environment
python -m venv .venv

# Activate it
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn app.main:app --reload --port 8000
```

**Windows (PowerShell):**

```powershell
cd lighthouse-attention\backend

# Create a virtual environment
python -m venv .venv

# Activate it
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn app.main:app --reload --port 8000
```

**Windows (Command Prompt):**

```cmd
cd lighthouse-attention\backend
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Expected output:**

```
INFO:     Will watch for changes in these directories: ['.../backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [...]
INFO:     Started server process [...]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

> The `--reload` flag restarts the server automatically when you edit a Python file. Remove it in production.

---

### Frontend Setup

In the second terminal window:

**macOS / Linux / Windows (all shells):**

```bash
cd lighthouse-attention/frontend

# Install Node dependencies
npm install

# Start the Vite dev server
npm run dev
```

**Expected output:**

```
  VITE v7.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

The page loads, calls `GET /api/examples`, and runs the first analysis automatically.

---

## Option B — Docker Compose

Make sure Docker Desktop is running, then from the project root:

```bash
cd lighthouse-attention
docker-compose up --build
```

Docker builds two images and starts two containers:

| Container | Host port | Service |
|---|---|---|
| `backend` | 8000 | FastAPI |
| `frontend` | 5173 | Vite dev server |

The backend healthcheck runs every 10 seconds. The frontend waits for the backend to be healthy before starting.

**Expected output (truncated):**

```
[+] Building backend ...
[+] Building frontend ...
[+] Running 2/2
 ✔ Container lighthouse-backend   Healthy
 ✔ Container lighthouse-frontend  Started
```

Open **[http://localhost:5173](http://localhost:5173)**.

**Stop and remove containers:**

```bash
docker-compose down
```

**Rebuild after code changes:**

```bash
docker-compose up --build
```

---

## Verifying the Setup

Once both services are running, verify each layer:

### 1. Backend health check

```bash
curl http://localhost:8000/api/health
```

Expected:

```json
{"status": "ok", "service": "lighthouse-attention-lab"}
```

### 2. Examples endpoint

```bash
curl http://localhost:8000/api/examples | python -m json.tool | head -20
```

Expected: a JSON array with at least 3 example documents.

### 3. Interactive API docs

Open **[http://localhost:8000/docs](http://localhost:8000/docs)** in your browser. FastAPI generates a Swagger UI automatically where you can call every endpoint.

### 4. Frontend

Open **[http://localhost:5173](http://localhost:5173)**. The page should:

1. Load the hero section and explanation cards.
2. Auto-select the first example document.
3. Display a loading spinner labelled "Computing attention paths...".
4. Render metrics, heatmaps, retrieval demo, and document explorer.

---

## Environment Variables

The project works with no environment variables. These optional overrides exist:

| Variable | Default | Where to set | Effect |
|---|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Shell before `npm run dev`, or `.env` file in `frontend/` | Points the frontend at a different backend host/port |

**Example — running backend on a different port:**

```bash
# Terminal 1
uvicorn app.main:app --reload --port 8001

# Terminal 2
VITE_API_URL=http://localhost:8001 npm run dev
```

**Windows PowerShell:**

```powershell
$env:VITE_API_URL = "http://localhost:8001"
npm run dev
```

**Using a `.env` file (frontend only):**

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8001
```

> Vite reads `.env` automatically. Do not commit `.env` files — they are listed in `.gitignore`.

---

## Running Tests

**Backend (pytest):**

```bash
cd lighthouse-attention/backend
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pytest -v
```

Expected: 9 tests, all passing in under 5 seconds.

**Frontend (TypeScript type-check + production build):**

```bash
cd lighthouse-attention/frontend
npm run build
```

Expected: `tsc --noEmit` passes with no errors, then Vite produces a `dist/` folder.

**Run both checks with one script (macOS/Linux):**

```bash
cd lighthouse-attention
./scripts/test.sh
```

> On Windows, run the backend and frontend commands directly as shown above.

---

## Stopping the Services

**Local development:**

Press `Ctrl+C` in each terminal.

To deactivate the Python virtual environment:

```bash
deactivate
```

**Docker:**

```bash
docker-compose down
```

---

## Troubleshooting

### Backend is not starting

**Symptom:** `ModuleNotFoundError: No module named 'fastapi'`

**Fix:** The virtual environment is not activated or `pip install` was not run.

```bash
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt

# Windows
.venv\Scripts\activate
pip install -r requirements.txt
```

---

### Port 8000 is already in use

**Symptom:** `ERROR: [Errno 98] Address already in use`

**Fix A — find and stop the existing process:**

```bash
# macOS/Linux
lsof -ti:8000 | xargs kill

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process
```

**Fix B — run on a different port:**

```bash
uvicorn app.main:app --reload --port 8001
# then set VITE_API_URL=http://localhost:8001 for the frontend
```

---

### Port 5173 is already in use

```bash
npm run dev -- --port 5174
```

---

### Frontend shows "Backend is not running"

The frontend loaded but cannot reach the API. Check:

1. Is the backend terminal still running? Look for `Uvicorn running on http://0.0.0.0:8000`.
2. Is it on port 8000? If you changed the port, set `VITE_API_URL` accordingly.
3. Visit **http://localhost:8000/api/health** directly — if it loads, the backend is up.

---

### npm install errors

**Node.js version too old:**

```bash
node --version    # must be 20+
```

If you need to update, use [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows).

**Corrupted node_modules:**

```bash
# macOS/Linux
rm -rf node_modules package-lock.json
npm install

# Windows PowerShell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

---

### Python virtual environment issues

**Wrong Python version (needs 3.10+):**

```bash
python --version        # check
python3.12 -m venv .venv   # use a specific version if needed
```

**macOS with multiple Python installations:**

```bash
# Use pyenv to manage versions
pyenv install 3.12.0
pyenv local 3.12.0
python -m venv .venv
```

---

### Docker issues

**Docker Desktop is not running:**

Start Docker Desktop, wait for it to show "running", then retry `docker-compose up --build`.

**Port conflicts with Docker:**

Edit `docker-compose.yml` and change the host port mapping:

```yaml
ports:
  - "8001:8000"   # maps host:8001 → container:8000
```

Then set `VITE_API_URL=http://localhost:8001` in the frontend environment section.

**Frontend container starts before backend is ready:**

The `docker-compose.yml` includes a healthcheck and `depends_on: condition: service_healthy`. If you see the frontend fail immediately, check `docker-compose logs backend` for the backend error.

---

### Build errors after pulling new changes

```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install

# Docker
docker-compose up --build
```

---

### TypeScript build fails

```bash
cd frontend
npm run build
```

Read the TypeScript error output. Common causes: a missing type import, a `null` check, or a version mismatch after `npm install`. Make sure Node.js is 20+.
