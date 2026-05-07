# CI/CD Workflow Generator — Agent Context File
> Load this file at the start of every session. This is the project memory.

---

## Project Overview

**CI/CD Workflow Generator** is a web tool that auto-generates GitHub Actions pipeline YAML files from a project profile. The user provides a GitHub repository URL, the tool reads and parses the repo to detect the stack, pre-fills a customization wizard, generates a validated YAML workflow, and optionally opens a Pull Request on the user's repo with the generated file.

Academic context: S4 Projet Fédérateur — *"CI/CD Workflow Generator from Project Requirements"*
Supervised by: Pr. Youness BOUTYOUR
Team size: Binôme (2 students)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI |
| Template engine | Jinja2 |
| YAML validation | yamllint + custom rule engine |
| GitHub integration | PyGithub (GitHub REST API v3) |
| Auth (GitHub OAuth) | Authlib + FastAPI OAuth2 |
| Frontend | React 18, Vite, React Router v6, Tailwind CSS |
| HTTP client | Axios |
| State | React Context + useReducer |
| YAML editor | CodeMirror 6 |
| Containerization | Docker + Docker Compose |
| Testing | pytest (backend), Vitest (frontend) |

---

## Project Structure

### Backend
```
backend/
├── main.py                        FastAPI app entry point
├── requirements.txt
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── detect.py          POST /api/v1/detect
│   │   │   ├── generate.py        POST /api/v1/generate
│   │   │   ├── validate.py        POST /api/v1/validate
│   │   │   ├── github.py          POST /api/v1/github/pr, GET /api/v1/github/status
│   │   │   └── auth.py            GET /api/v1/auth/github, GET /api/v1/auth/callback
│   │   └── deps.py                shared FastAPI dependencies (auth, current_user)
│   ├── core/
│   │   ├── config.py              env vars, settings (pydantic BaseSettings)
│   │   └── exceptions.py          AppException, global exception handler
│   ├── detector/
│   │   ├── repo_reader.py         GitHub API calls to read repo file tree + file contents
│   │   ├── stack_detector.py      parse project files → DetectedStack model
│   │   └── parsers/
│   │       ├── python_parser.py   parse requirements.txt / pyproject.toml
│   │       ├── node_parser.py     parse package.json
│   │       └── java_parser.py     parse pom.xml / build.gradle
│   ├── generator/
│   │   ├── pipeline_builder.py    select + render templates → raw YAML string
│   │   ├── template_registry.py   load and index all templates from /templates/
│   │   └── models.py              ProjectProfile, GeneratedPipeline pydantic models
│   ├── validator/
│   │   ├── yaml_validator.py      run yamllint on generated YAML
│   │   ├── rule_engine.py         run custom rules → list of ValidationResult
│   │   └── rules/
│   │       ├── order_rules.py     tests must run before deploy
│   │       ├── secret_rules.py    no hardcoded passwords/tokens
│   │       └── branch_rules.py    push/PR triggers must be present
│   └── github_client/
│       ├── oauth.py               GitHub OAuth flow
│       ├── repo_client.py         create branch, commit file, open PR
│       └── poll_client.py         poll workflow run status via GitHub API
├── templates/
│   ├── python_test_only.yml.j2
│   ├── python_lint_test.yml.j2
│   ├── node_test_only.yml.j2
│   ├── node_lint_test.yml.j2
│   ├── java_maven_test.yml.j2
│   ├── docker_build.yml.j2
│   ├── security_scan.yml.j2
│   └── cache_deps.yml.j2          (partial, included by others)
└── tests/
    ├── test_detector.py
    ├── test_generator.py
    ├── test_validator.py
    └── snapshots/                 expected YAML files for snapshot tests
        ├── python_profile.yml
        ├── node_profile.yml
        └── java_profile.yml
```

### Frontend
```
frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── api/
│   │   ├── detect.js              detectStack(repoUrl)
│   │   ├── generate.js            generatePipeline(profile)
│   │   ├── validate.js            validateYaml(yaml)
│   │   ├── github.js              createPR(repoUrl, yaml), pollStatus(runId)
│   │   └── auth.js                getAuthUrl(), handleCallback(), logout()
│   ├── context/
│   │   ├── AuthContext.jsx        GitHub OAuth token + user info
│   │   └── WizardContext.jsx      wizard step state + detected stack + profile
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useWizard.js
│   │   └── usePollStatus.js       polls /api/v1/github/status every 5s
│   ├── pages/
│   │   ├── Home.jsx               landing page + repo URL input
│   │   ├── Wizard.jsx             multi-step wizard shell
│   │   ├── Result.jsx             YAML preview + validation report + actions
│   │   ├── Status.jsx             live pipeline run status display
│   │   └── OAuthCallback.jsx      handles GitHub OAuth redirect
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── PageWrapper.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Stepper.jsx        visual step indicator for wizard
│   │   │   ├── Tag.jsx            colored pill for labels (language, framework…)
│   │   │   ├── Spinner.jsx
│   │   │   └── Toggle.jsx         on/off toggle for optional checks
│   │   └── feature/
│   │       ├── RepoInput.jsx      repo URL input + "Analyze" button
│   │       ├── StackSummary.jsx   detected stack display with confirm/edit
│   │       ├── CheckSelector.jsx  list of toggleable CI checks
│   │       ├── YamlPreview.jsx    CodeMirror 6 YAML viewer (read-only)
│   │       ├── ValidationReport.jsx  errors/warnings panel
│   │       └── StatusTracker.jsx  live run status with step-by-step jobs
│   └── utils/
│       ├── constants.js           CHECK_OPTIONS, SUPPORTED_LANGUAGES, etc.
│       └── formatValidation.js    format validation results for display
```

---

## API Conventions

- All endpoints are prefixed with `/api/v1`
- All responses follow: `{ success: bool, message: str, data: any }`
- Errors use `AppException` caught by the global exception handler
- GitHub OAuth token is sent as `Authorization: Bearer <token>` on protected routes
- The backend never stores user code — repo contents are read in memory and discarded

### Endpoint Map

| Module | Method | Endpoint | Auth required |
|---|---|---|---|
| Auth | GET | `/api/v1/auth/github` | No |
| Auth | GET | `/api/v1/auth/callback` | No |
| Detect | POST | `/api/v1/detect` | No (public repos) / Yes (private) |
| Generate | POST | `/api/v1/generate` | No |
| Validate | POST | `/api/v1/validate` | No |
| GitHub PR | POST | `/api/v1/github/pr` | Yes |
| GitHub Status | GET | `/api/v1/github/status/{runId}` | Yes |

### Key Request/Response Models

```python
# POST /api/v1/detect
{ "repo_url": "https://github.com/user/repo" }
→ { "language": "python", "version": "3.11", "framework": "fastapi",
    "test_framework": "pytest", "linter": "flake8", "has_docker": true,
    "package_manager": "pip" }

# POST /api/v1/generate
{ "language": "python", "framework": "fastapi", "checks": ["lint", "test", "docker"],
  "branch_trigger": "push", "python_version": "3.11" }
→ { "yaml": "name: CI\n...", "template_used": "python_lint_test" }

# POST /api/v1/validate
{ "yaml": "name: CI\n..." }
→ { "valid": true, "errors": [], "warnings": [{ "rule": "no_cache", "message": "..." }] }

# POST /api/v1/github/pr
{ "repo_url": "...", "yaml": "...", "branch_name": "ci/add-pipeline" }
→ { "pr_url": "https://github.com/user/repo/pull/1", "run_id": "123456" }
```

---

## Templates

Templates live in `backend/templates/` and are Jinja2 files (`.yml.j2`).

**8 templates (minimum MVP):**

| Template file | Description |
|---|---|
| `python_test_only.yml.j2` | pytest only, no lint |
| `python_lint_test.yml.j2` | flake8/black + pytest |
| `node_test_only.yml.j2` | jest/vitest only |
| `node_lint_test.yml.j2` | eslint + jest/vitest |
| `java_maven_test.yml.j2` | mvn test |
| `docker_build.yml.j2` | docker build + push (optional) |
| `security_scan.yml.j2` | Trivy or CodeQL scan job |
| `cache_deps.yml.j2` | partial included by others via Jinja2 include |

**Template variables (passed by pipeline_builder.py):**

```jinja2
{{ language }}         python | node | java
{{ version }}          e.g. "3.11", "18", "17"
{{ test_command }}     e.g. "pytest", "npm test", "mvn test"
{{ lint_command }}     e.g. "flake8 .", "npm run lint"
{{ has_docker }}       true | false
{{ branch_trigger }}   push | pull_request | both
{{ cache_key }}        e.g. "pip", "npm", "maven"
```

---

## Validation Rules

Custom rules live in `backend/app/validator/rules/`. Each rule is a function that takes a parsed YAML dict and returns a list of `ValidationResult(level, rule_id, message)`.

| Rule ID | Level | Description |
|---|---|---|
| `tests_before_deploy` | ERROR | Deploy job must declare `needs: [test]` |
| `no_hardcoded_secrets` | ERROR | No `password:`, `token:`, `secret:` with literal values |
| `triggers_present` | ERROR | Workflow must have at least one `on:` trigger |
| `test_job_exists` | WARNING | No job named `test` or `run-tests` found |
| `cache_missing` | WARNING | No cache step found — consider adding one |
| `no_timeout` | WARNING | Jobs have no `timeout-minutes` set |

---

## Wizard Steps

The frontend wizard has 4 steps managed by `WizardContext`:

| Step | Name | What happens |
|---|---|---|
| 1 | Repo input | User pastes GitHub URL → hits "Analyze" → calls `/detect` |
| 2 | Stack confirm | Show detected stack, user can edit any field |
| 3 | Check selection | Toggle list of CI checks to include |
| 4 | Review & generate | Calls `/generate` then `/validate`, shows result page |

---

## Important Rules

### Backend Rules
- Every route handler returns `JSONResponse` with the standard `{ success, message, data }` shape
- All business logic lives in `detector/`, `generator/`, `validator/` — never in route handlers
- Route handlers only call service functions and return responses
- Never store user repo contents to disk — read in memory, process, discard
- All Pydantic models use strict typing — no `Any` fields without justification
- Jinja2 templates must never contain Python logic — only variable substitution and simple conditionals
- New validation rules are added as separate files in `rules/` — never modify `rule_engine.py` to add rules inline
- All GitHub API calls go through `github_client/` — never call PyGithub directly in route handlers

### Frontend Rules
- All API calls go through `src/api/` — never call axios directly in a component
- No inline styles — Tailwind utility classes only
- All pages must be wrapped in `<PageWrapper>`
- Wizard state (detected stack, profile, generated YAML) lives in `WizardContext` only
- GitHub OAuth token stored in `localStorage` via `useAuth` hook only — never in component state
- `YamlPreview` is read-only — the user cannot edit the YAML directly (simplifies validation flow)
- Every component that fetches data must handle loading and error states explicitly
- `src/components/ui/` components are generic — no business logic inside them

### Git Rules
- Branch naming: `feature/week{N}-{module}` (e.g. `feature/week2-detector`)
- Commit format: `[Week N] Short description` (e.g. `[Week 3] Add Jinja2 template engine`)
- Never commit directly to `main`
- Each template change gets its own commit

---

## Sprint Overview

| Week | Person A (Frontend + Templates) | Person B (Backend + Validation) |
|---|---|---|
| 1 | Vite + React setup, Home page, RepoInput component | FastAPI setup, /detect endpoint, repo_reader.py |
| 2 | Wizard shell (steps 1–2), StackSummary, WizardContext | stack_detector.py + all 3 parsers (Python/Node/Java) |
| 3 | Step 3–4 wizard, CheckSelector, Toggle UI | Jinja2 template engine + 8 templates |
| 4 | Result page, YamlPreview (CodeMirror), ValidationReport | Validator service: yamllint + 6 custom rules |
| 5 | GitHub OAuth UI, OAuthCallback page, PR button | GitHub OAuth flow + PR creation endpoint |
| 6 | StatusTracker component, usePollStatus hook | Status polling endpoint + Docker Compose |
| 7 | Polish, empty states, error handling, mobile layout | Snapshot tests (3 profiles), fix edge cases |
| 8 | Demo prep, user guide, final integration testing | Report writing, architecture diagram, limits section |

---

## Key Commands

```bash
# Backend
uvicorn main:app --reload --port 8000
pytest
pip install -r requirements.txt

# Frontend
npm run dev
npm run build
npm run lint
npx vitest

# Docker
docker-compose up --build
docker-compose down

# Validate a YAML manually
yamllint .github/workflows/pipeline.yml
```

---

## Check Options (keep in sync between BE constants and FE constants.js)

| Check ID | Label | Description |
|---|---|---|
| `lint` | Linting | Run linter (flake8, eslint, checkstyle) |
| `test` | Tests | Run test suite |
| `docker` | Docker build | Build Docker image |
| `security` | Security scan | Run Trivy or CodeQL |
| `cache` | Dependency cache | Cache pip/npm/maven dependencies |
| `deploy_sim` | Deploy (simulated) | Echo deploy step, requires test to pass |

---

## Environment Variables

```env
# backend/.env
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
SECRET_KEY=your_jwt_signing_secret
FRONTEND_URL=http://localhost:3000

# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
VITE_GITHUB_CLIENT_ID=your_github_oauth_app_client_id
```
