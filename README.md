# CI/CD Workflow Generator

> Auto-generate GitHub Actions pipeline YAML files from a project profile.

A web tool that reads a GitHub repository, detects the tech stack, and generates a production-ready GitHub Actions CI/CD workflow — tailored to your project.

---

## Features

- 🔍 **Auto-Detection** — Detects Python, Node.js, and Java projects from repo files
- 🛠️ **Customizable Pipeline** — Choose lint, test, Docker build, security scan, and more
- ✅ **Validation** — Runs yamllint + 6 custom rules before delivery
- 🐙 **GitHub Integration** — Opens a PR with the generated workflow file
- 📊 **Live Status** — Track your pipeline run in real-time

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- A [GitHub OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) (for PR creation)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/pfa-cicd-generator.git
cd pfa-cicd-generator
```

### 2. Configure environment variables

Create `backend/.env`:

```env
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
SECRET_KEY=your_jwt_signing_secret
FRONTEND_URL=http://localhost:3000
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GITHUB_CLIENT_ID=your_github_oauth_app_client_id
```

> ⚠️ **Never commit `.env` files.** They are already in `.gitignore`.

### 3. Build and run

```bash
docker-compose up --build
```

The app will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 4. Stop the application

```bash
docker-compose down
```

---

## Development Mode

For hot-reload during development, the `docker-compose.override.yml` is automatically applied:

```bash
docker-compose up --build
```

This gives you:
- **Backend**: `uvicorn --reload` with volume mounts (code changes auto-restart)
- **Frontend**: Vite dev server with HMR (instant UI updates)

To run **production mode only** (without dev override):

```bash
docker-compose -f docker-compose.yml up --build
```

---

## Running Without Docker

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Testing

### Backend Tests

```bash
cd backend
pip install pytest
pytest
```

### Frontend Lint

```bash
cd frontend
npm run lint
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, Jinja2, PyGithub |
| Frontend | React 18, Vite, Tailwind CSS, CodeMirror 6 |
| Containerization | Docker + Docker Compose |
| Testing | pytest (backend) |

---

## Project Structure

```
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── requirements.txt
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config, exceptions
│   │   ├── detector/     # Stack detection + parsers
│   │   ├── generator/    # Pipeline builder + templates
│   │   ├── validator/    # YAML + custom rules
│   │   └── github_client/ # OAuth, PR, status polling
│   ├── templates/        # Jinja2 workflow templates
│   └── tests/            # pytest test suite
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── src/
│   │   ├── api/          # Axios API layer
│   │   ├── components/   # UI + feature components
│   │   ├── context/      # React Context (Wizard, Auth)
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Route pages
│   │   └── utils/        # Constants, helpers
│   └── package.json
├── docker-compose.yml
├── docker-compose.override.yml
└── README.md
```

---

## License

Academic project — ENSIAS S4 Projet Fédérateur.
