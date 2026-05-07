# CI/CD Workflow Generator

> Automatically generate GitHub Actions pipeline YAML files from your project — detect your stack, customize your checks, and open a Pull Request in seconds.

Academic project — S4 Projet Fédérateur
Supervised by **Pr. Youness BOUTYOUR** | Team: Binôme (2 students)

---

## What is this?

The CI/CD Workflow Generator is a web tool that removes the friction of writing GitHub Actions pipelines from scratch. You paste a GitHub repository URL, the tool reads your project files to detect your language and stack, walks you through a short customization wizard, generates a validated YAML pipeline, and can open a Pull Request directly on your repository with the generated file.

No YAML knowledge required. No copy-pasting from docs. Just point it at your repo and go.

---

## How it works — the flow

```
Paste repo URL
      ↓
Tool reads the repo and detects your stack (language, framework, test tool, linter…)
      ↓
You confirm or correct the detected info in the wizard
      ↓
You select which CI checks to include (lint, tests, Docker build, security scan…)
      ↓
The tool generates a validated YAML pipeline
      ↓
Review the YAML, see any warnings or errors, then open a PR on your repo
      ↓
Watch the live pipeline run status
```

---

## Tech stack

### Backend

| What | Technology |
|---|---|
| Language | Python 3.11 |
| Web framework | FastAPI |
| Template engine | Jinja2 |
| YAML validation | yamllint + custom rule engine |
| GitHub integration | PyGithub (GitHub REST API v3) |
| GitHub authentication | Authlib + FastAPI OAuth2 |

### Frontend

| What | Technology |
|---|---|
| UI framework | React 18 |
| Build tool | Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| HTTP client | Axios |
| State management | React Context + useReducer |
| YAML editor | CodeMirror 6 |

### Infrastructure

| What | Technology |
|---|---|
| Containerization | Docker + Docker Compose |
| Backend tests | pytest |
| Frontend tests | Vitest |

---

## Project structure

### Backend (`backend/`)

The backend is organized into three independent business layers — each one does exactly one job.

```
backend/
├── main.py                        App entry point
├── requirements.txt
├── app/
│   ├── api/routes/                HTTP route handlers
│   │   ├── detect.py              POST /api/v1/detect
│   │   ├── generate.py            POST /api/v1/generate
│   │   ├── validate.py            POST /api/v1/validate
│   │   ├── github.py              PR creation + status polling
│   │   └── auth.py                GitHub OAuth flow
│   ├── core/
│   │   ├── config.py              Environment variables (pydantic BaseSettings)
│   │   └── exceptions.py          Global exception handler
│   │
│   ├── detector/                  ── Layer 1: reads the repo, detects the stack
│   │   ├── repo_reader.py         Fetches file tree + file contents via GitHub API
│   │   ├── stack_detector.py      Orchestrates parsers → returns DetectedStack
│   │   └── parsers/
│   │       ├── python_parser.py   Parses requirements.txt / pyproject.toml
│   │       ├── node_parser.py     Parses package.json
│   │       └── java_parser.py     Parses pom.xml / build.gradle
│   │
│   ├── generator/                 ── Layer 2: picks a template and renders it
│   │   ├── pipeline_builder.py    Selects + renders Jinja2 templates → raw YAML
│   │   ├── template_registry.py   Loads and indexes templates from /templates/
│   │   └── models.py              ProjectProfile, GeneratedPipeline (Pydantic models)
│   │
│   └── validator/                 ── Layer 3: checks the generated YAML
│       ├── yaml_validator.py      Runs yamllint
│       ├── rule_engine.py         Runs custom rules
│       └── rules/
│           ├── order_rules.py     Tests must run before deploy
│           ├── secret_rules.py    No hardcoded passwords or tokens
│           └── branch_rules.py    push/PR triggers must be present
│
├── templates/                     Jinja2 YAML templates (.yml.j2)
│   ├── python_test_only.yml.j2
│   ├── python_lint_test.yml.j2
│   ├── node_test_only.yml.j2
│   ├── node_lint_test.yml.j2
│   ├── java_maven_test.yml.j2
│   ├── docker_build.yml.j2
│   ├── security_scan.yml.j2
│   └── cache_deps.yml.j2          Partial template included by others
└── tests/
    ├── test_detector.py
    ├── test_generator.py
    ├── test_validator.py
    └── snapshots/                 Expected YAML outputs (snapshot tests)
```

### Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── api/                       All HTTP calls (never call axios directly in components)
│   │   ├── detect.js
│   │   ├── generate.js
│   │   ├── validate.js
│   │   ├── github.js
│   │   └── auth.js
│   ├── context/
│   │   ├── AuthContext.jsx        GitHub OAuth token + user info
│   │   └── WizardContext.jsx      Wizard step state + detected stack + profile
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useWizard.js
│   │   └── usePollStatus.js       Polls pipeline run status every 5s
│   ├── pages/
│   │   ├── Home.jsx               Landing page + repo URL input
│   │   ├── Wizard.jsx             Multi-step wizard shell
│   │   ├── Result.jsx             YAML preview + validation report + actions
│   │   ├── Status.jsx             Live pipeline run status
│   │   └── OAuthCallback.jsx      Handles GitHub OAuth redirect
│   └── components/
│       ├── layout/                Navbar, PageWrapper
│       ├── ui/                    Button, Input, Modal, Stepper, Tag, Spinner, Toggle
│       └── feature/               RepoInput, StackSummary, CheckSelector,
│                                  YamlPreview, ValidationReport, StatusTracker
```

---

## API reference

All endpoints are prefixed with `/api/v1`. All responses follow this shape:

```json
{ "success": true, "message": "...", "data": { ... } }
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/auth/github` | No | Start GitHub OAuth flow |
| GET | `/api/v1/auth/callback` | No | OAuth callback handler |
| POST | `/api/v1/detect` | Optional* | Detect stack from repo URL |
| POST | `/api/v1/generate` | No | Generate YAML from project profile |
| POST | `/api/v1/validate` | No | Validate a YAML string |
| POST | `/api/v1/github/pr` | Yes | Open a PR with the generated YAML |
| GET | `/api/v1/github/status/{runId}` | Yes | Poll pipeline run status |

*Auth is required for private repositories, optional for public ones.

### Example: detect a stack

```json
// Request
POST /api/v1/detect
{ "repo_url": "https://github.com/user/my-project" }

// Response
{
  "language": "python",
  "version": "3.11",
  "framework": "fastapi",
  "test_framework": "pytest",
  "linter": "flake8",
  "has_docker": true,
  "package_manager": "pip"
}
```

### Example: generate a pipeline

```json
// Request
POST /api/v1/generate
{
  "language": "python",
  "framework": "fastapi",
  "checks": ["lint", "test", "docker"],
  "branch_trigger": "push",
  "python_version": "3.11"
}

// Response
{
  "yaml": "name: CI\n...",
  "template_used": "python_lint_test"
}
```

---

## Templates

The tool ships with 8 Jinja2 templates. The right one is automatically selected based on your project profile.

| Template | When it's used |
|---|---|
| `python_test_only` | Python projects — tests only, no linter |
| `python_lint_test` | Python projects — flake8/black + pytest |
| `node_test_only` | Node.js projects — jest/vitest only |
| `node_lint_test` | Node.js projects — eslint + jest/vitest |
| `java_maven_test` | Java projects — `mvn test` |
| `docker_build` | Any project with a Dockerfile — build + optional push |
| `security_scan` | Any project — Trivy or CodeQL scan job |
| `cache_deps` | Partial template included by the others for dependency caching |

All templates accept the same set of variables: `language`, `version`, `test_command`, `lint_command`, `has_docker`, `branch_trigger`, `cache_key`.

---

## Validation rules

After generation, the YAML is checked by yamllint and six custom rules:

| Rule | Severity | What it checks |
|---|---|---|
| `tests_before_deploy` | ERROR | Deploy job must declare `needs: [test]` |
| `no_hardcoded_secrets` | ERROR | No literal values in `password`, `token`, or `secret` fields |
| `triggers_present` | ERROR | Workflow must have at least one `on:` trigger |
| `test_job_exists` | WARNING | No job named `test` or `run-tests` was found |
| `cache_missing` | WARNING | No cache step found — recommend adding one |
| `no_timeout` | WARNING | Jobs have no `timeout-minutes` set |

Errors block the PR button. Warnings are shown but do not block.

---

## The wizard — step by step

| Step | Name | What happens |
|---|---|---|
| 1 | Repo input | Paste a GitHub URL and click Analyze |
| 2 | Stack confirmation | Review the detected stack, edit anything that's wrong |
| 3 | Check selection | Toggle which CI checks to include (lint, tests, Docker, security…) |
| 4 | Review & generate | The YAML is generated and validated — review it, then open a PR |

---

## Available CI checks

| Check | Label | What it runs |
|---|---|---|
| `lint` | Linting | flake8 / eslint / checkstyle depending on language |
| `test` | Tests | pytest / jest+vitest / mvn test |
| `docker` | Docker build | Builds (and optionally pushes) the Docker image |
| `security` | Security scan | Trivy or CodeQL |
| `cache` | Dependency cache | Caches pip / npm / maven dependencies |
| `deploy_sim` | Deploy (simulated) | Echo deploy step — requires `test` to pass first |

---

## Getting started

### Prerequisites

- Docker and Docker Compose installed
- A GitHub OAuth App (Client ID + Secret) — [create one here](https://github.com/settings/developers)

### Environment variables

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

### Run with Docker

```bash
docker-compose up --build
```

The app will be available at `http://localhost:3000`.

### Run locally (without Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Run tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npx vitest
```

### Validate a YAML file manually

```bash
yamllint .github/workflows/pipeline.yml
```

---

## Git conventions

| Convention | Format |
|---|---|
| Branch naming | `feature/week{N}-{module}` e.g. `feature/week2-detector` |
| Commit format | `[Week N] Short description` e.g. `[Week 3] Add Jinja2 template engine` |
| Never commit to | `main` directly |

---

## Known limitations

- **Private repositories** require GitHub OAuth — public repos work without authentication
- **Monorepos** with multiple languages in the same repo are not currently supported
- **GitLab CI**, Bitbucket Pipelines, and other CI systems are not supported — GitHub Actions only
- **Advanced matrix strategies** (testing across multiple OS/language version combinations) are not generated
- **Cloud deployment** steps (AWS, GCP, Azure) are not included in the current templates

---

## Project roadmap (future ideas)

- GitLab CI support
- YAML repair mode — automatically fix detected errors
- Policy engine — enforce SAST/SBOM requirements organization-wide
- AI-assisted rule suggestions based on project type
- Support for monorepos with multiple detected stacks
