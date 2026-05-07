# CI/CD Workflow Generator — Claude Prompt Playbook
## Weeks 1–8 | Backend + Frontend

> **How to use this file**
> 1. Start every session by pasting the contents of `agent.md` first, then say: *"This is the project context. Do not build anything yet — just confirm you understand the stack, structure, and rules."*
> 2. Then paste the week prompt you are working on.
> 3. Use the Three-Section Pattern (Task / Background / Do Not) for every feature prompt.
> 4. When asking for a follow-up fix or addition, always reference the relevant section of `agent.md` so Claude does not drift.

---

---

# WEEK 1 — Project Scaffold + Repo Detection Foundation

---

## Opening Session Prompt (paste this first, every new chat)

```
Read the following project context file carefully. This is the memory for our entire project.
Do not generate any code yet. Confirm you understand the project, the tech stack, the folder
structure, the API conventions, and the rules before we begin.

[PASTE CONTENTS OF agent.md HERE]
```

---

## Week 1 — Prompt 1 (Person B): FastAPI Backend Scaffold + /detect Endpoint Shell

### THE TASK
Bootstrap the FastAPI backend for the CI/CD Workflow Generator. Set up the project structure,
configure the app entry point, create the standard API response wrapper, the global exception
handler, and a working but minimal POST /api/v1/detect endpoint that accepts a repo URL and
returns a hardcoded DetectedStack for now. The project must start with `uvicorn main:app --reload`
and return a properly shaped response before any real logic is added.

### BACKGROUND INFORMATION
- Stack: Python 3.11, FastAPI, Pydantic v2
- Full folder structure is in agent.md under "Backend"
- API response shape: `{ success: bool, message: str, data: any }` — defined in agent.md under "API Conventions"
- AppException must be caught by the global exception handler and returned as a standard error response
- The detect endpoint accepts: `{ "repo_url": "https://github.com/user/repo" }`
- Return a hardcoded DetectedStack for now: `{ "language": "python", "version": "3.11", "framework": "fastapi", "test_framework": "pytest", "linter": "flake8", "has_docker": false, "package_manager": "pip" }`
- Environment variables are loaded from `.env` using pydantic BaseSettings in `app/core/config.py`

### DO NOT
- Do not implement real GitHub API calls yet — repo_reader.py is created but left as a stub
- Do not implement the generator or validator yet — those are separate modules
- Do not add GitHub OAuth yet — that is Week 5
- Do not add any database — this project has no persistent storage

---

## Week 1 — Prompt 2 (Person A): React Frontend Scaffold + Home Page

### THE TASK
Bootstrap the React 18 frontend using Vite. Set up React Router v6 with routes for Home (/),
Wizard (/wizard), Result (/result), and a placeholder OAuthCallback (/auth/callback). Build
the Home page with a Navbar and a centered RepoInput component. RepoInput shows a text field
for the GitHub repo URL and an "Analyze" button. On click, it calls the detect API and navigates
to /wizard on success. On error, it shows the error message inline below the input.

### BACKGROUND INFORMATION
- Stack: React 18, Vite, React Router v6, Tailwind CSS, Axios
- All API calls go through src/api/ — create src/api/detect.js with detectStack(repoUrl)
- Axios base URL: read from `import.meta.env.VITE_API_BASE_URL`
- RepoInput is a feature component in src/components/feature/RepoInput.jsx
- Navbar is in src/components/layout/Navbar.jsx — shows project name and a placeholder "Connect GitHub" button (non-functional for now)
- All pages are wrapped in PageWrapper (src/components/layout/PageWrapper.jsx)
- WizardContext (src/context/WizardContext.jsx) must be created now — stores detectedStack and currentStep, initialized to null and 1 respectively
- After successful detection, store the result in WizardContext and navigate to /wizard

### DO NOT
- Do not build the Wizard page yet — a placeholder "Wizard coming soon" is enough
- Do not implement OAuth or the GitHub Connect button logic yet
- Do not style with anything other than Tailwind utility classes
- Do not call axios directly in RepoInput — all calls go through src/api/detect.js

---

---

# WEEK 2 — Stack Detection Engine

---

## Week 2 — Prompt 1 (Person B): repo_reader.py + stack_detector.py + Python Parser

### THE TASK
Implement real stack detection for Python projects. This includes:
- `repo_reader.py`: uses PyGithub to fetch the file tree and read specific file contents from
  a public GitHub repo by URL. Expose two functions: `get_file_tree(repo_url) → list[str]`
  and `read_file(repo_url, path) → str | None`.
- `python_parser.py`: parse `requirements.txt` or `pyproject.toml` content and return
  detected test framework (pytest/unittest), linter (flake8/black/pylint), and whether
  Django/FastAPI/Flask is present.
- `stack_detector.py`: orchestrate repo_reader + parsers. Call the right parser based on
  which manifest files are present. Return a filled `DetectedStack` Pydantic model.
- Wire the real detection into the POST /api/v1/detect route (replace the hardcoded stub).

### BACKGROUND INFORMATION
- PyGithub is already in requirements.txt — use `Github(token=None)` for public repos
- `repo_url` format: `https://github.com/{owner}/{repo}` — parse owner and repo from the URL
- If neither `requirements.txt` nor `pyproject.toml` is found, return `language: unknown`
- DetectedStack fields are defined in agent.md under "Key Request/Response Models"
- Detection is best-effort — missing fields return null, not errors
- The GitHub API token (if present in config) should be used to avoid rate limiting

### DO NOT
- Do not implement Node or Java parsers yet — those come in the next prompt
- Do not add OAuth token passing yet — use the public GitHub token from config only
- Do not raise an exception if a file is not found — return None from read_file gracefully
- Do not modify the API response wrapper or exception handler from Week 1

---

## Week 2 — Prompt 2 (Person B): Node Parser + Java Parser

### THE TASK
Add detection support for Node.js and Java projects.
- `node_parser.py`: parse `package.json` content — detect test framework (jest/vitest/mocha),
  linter (eslint/prettier), framework (express/next/vite), node version from `engines` field,
  and whether a Dockerfile is present in the repo tree.
- `java_parser.py`: parse `pom.xml` or `build.gradle` content — detect Java version,
  build tool (maven/gradle), test framework (junit/testng), and framework (spring/quarkus).
- Update `stack_detector.py` to try Node detection if `package.json` is found, Java detection
  if `pom.xml` or `build.gradle` is found.
- Add a `has_docker` check to all parsers: true if `Dockerfile` appears in the repo file tree.

### BACKGROUND INFORMATION
- Parse package.json as JSON (use Python's `json.loads`)
- Parse pom.xml with Python's `xml.etree.ElementTree` — do not install additional XML libraries
- For build.gradle (Groovy DSL), use simple string search — no need to fully parse Groovy syntax
- Detection priority: if both pom.xml and build.gradle exist, prefer pom.xml
- All parser functions receive file content as a string, not a file path
- stack_detector.py must remain the single entry point — route handler calls only stack_detector

### DO NOT
- Do not modify repo_reader.py — it is already complete
- Do not add any new API endpoints — only detection logic changes
- Do not raise exceptions for malformed files — catch parse errors and return partial results

---

## Week 2 — Prompt 3 (Person A): Wizard Steps 1–2 + StackSummary Component

### THE TASK
Build the Wizard page (/wizard) with the first two steps managed by WizardContext.

Step 1 (Repo input recap): Show the repo URL that was analyzed, the detected language, and
a "Re-analyze" button that sends the user back to Home. This step is skipped if the user
arrives from Home with a valid detectedStack already in context.

Step 2 (Stack confirmation): Show a StackSummary component with all detected fields
(language, version, framework, test framework, linter, Docker). Each field is displayed as
a labeled row with the detected value and a small "Edit" button that turns the row into an
inline text input. The user can correct any wrong detection. A "Looks good →" button advances
to step 3.

Add a Stepper UI component (src/components/ui/Stepper.jsx) that shows the 4 wizard steps
as numbered dots with labels, with the active step highlighted.

### BACKGROUND INFORMATION
- WizardContext already stores detectedStack — update it with the confirmed/edited profile when the user clicks "Looks good"
- StackSummary is a feature component in src/components/feature/StackSummary.jsx
- Stepper takes props: steps (array of label strings), currentStep (number)
- If the user lands on /wizard with no detectedStack in context (e.g. direct URL), redirect them to /
- Tag component (src/components/ui/Tag.jsx) should be used to display language/framework as colored pills

### DO NOT
- Do not build steps 3 and 4 yet — show "Coming soon" placeholders
- Do not call the generate or validate API yet
- Do not add any navigation outside of WizardContext step management
- Do not modify RepoInput or the Home page

---

---

# WEEK 3 — Template Engine + Check Selector

---

## Week 3 — Prompt 1 (Person B): Jinja2 Template Engine + 8 Templates

### THE TASK
Implement the full template engine and create all 8 pipeline templates.

- `template_registry.py`: scans the `templates/` directory, loads all `.yml.j2` files, and
  exposes `get_template(name: str) → jinja2.Template` and `list_templates() → list[str]`.
- `pipeline_builder.py`: receives a `ProjectProfile` Pydantic model, selects the right
  template(s) based on language + enabled checks, renders them with Jinja2, and returns
  a `GeneratedPipeline` with the final YAML string and the template name used.
- Create all 8 templates listed in agent.md. Each must be a valid GitHub Actions YAML file
  when rendered. `cache_deps.yml.j2` is a Jinja2 partial included by others with
  `{% include 'cache_deps.yml.j2' %}`.
- Wire the real generator into POST /api/v1/generate (replace any stub).

### BACKGROUND INFORMATION
- ProjectProfile fields match the POST /api/v1/generate request body in agent.md "Key Request/Response Models"
- Template variable names are defined in agent.md under "Templates"
- Template selection logic: start with the base template for the language, then include docker_build.yml.j2 and/or security_scan.yml.j2 as extra jobs if those checks are enabled
- A generated workflow must always have at minimum: a `name`, an `on:` trigger, and one job
- Use `jinja2.Environment(loader=FileSystemLoader(...))` — do not use PackageLoader

### DO NOT
- Do not add logic inside templates beyond `{% if %}` and `{% include %}` — no loops over dynamic data
- Do not create a database or store generated YAMLs — return them in the response only
- Do not modify the detector or validator modules
- Do not change the API response wrapper

---

## Week 3 — Prompt 2 (Person A): Wizard Steps 3–4 + CheckSelector Component

### THE TASK
Build wizard steps 3 and 4.

Step 3 (Check selection): Show the CheckSelector component — a list of all available CI checks
from `constants.js` (lint, test, docker, security, cache, deploy_sim), each as a card with a
label, short description, and a Toggle switch. Checks that were detected as present in the
project (e.g. linter detected → lint pre-toggled on) start toggled on. The user can override
any toggle. A "Generate pipeline →" button calls POST /api/v1/generate with the full profile
and advances to step 4.

Step 4 (Review): Show a loading spinner while generate is running. On success, store the
generated YAML in WizardContext and navigate to /result.

### BACKGROUND INFORMATION
- CHECK_OPTIONS constant in src/utils/constants.js: array of `{ id, label, description }`
- CheckSelector is a feature component: src/components/feature/CheckSelector.jsx
- Toggle is a generic UI component: src/components/ui/Toggle.jsx — takes `checked` and `onChange` props
- API call: src/api/generate.js → generatePipeline(profile) — POSTs the full ProjectProfile
- ProjectProfile = detectedStack (confirmed in step 2) + array of selected check IDs
- On API error in step 4, show the error message and a "Back" button — do not crash the wizard

### DO NOT
- Do not call /validate from the wizard — validation happens on the Result page
- Do not allow the user to edit the YAML directly anywhere in the wizard
- Do not add any new context beyond WizardContext for wizard state
- Do not modify steps 1 or 2

---

---

# WEEK 4 — Validator Service + Result Page

---

## Week 4 — Prompt 1 (Person B): Validator Service + 6 Custom Rules

### THE TASK
Implement the full validation service. This includes:
- `yaml_validator.py`: run `yamllint` on the YAML string (using Python subprocess or the
  yamllint Python API) and return a list of `ValidationResult(level="error"|"warning", rule_id="yamllint", message=str)`.
- `rule_engine.py`: parse the YAML string with PyYAML into a dict, then run each rule function
  in `rules/` against it, collect results. Expose `run_all_rules(yaml_str: str) → list[ValidationResult]`.
- Implement all 6 rules from agent.md in their respective files.
- Wire both into POST /api/v1/validate: run yamllint first, then custom rules, return combined results.

### BACKGROUND INFORMATION
- ValidationResult: `{ level: "error" | "warning", rule_id: str, message: str }`
- Validation response shape (from agent.md): `{ valid: bool, errors: [...], warnings: [...] }`
- `valid` is true only if there are zero errors (warnings are allowed)
- Rule files are standalone functions — `rule_engine.py` imports and calls them, it does not define rules itself
- Use `import yaml` (PyYAML) to parse the YAML dict for rule evaluation
- The 6 rules and their IDs are defined in agent.md under "Validation Rules"

### DO NOT
- Do not add more than 6 rules in this prompt — the rule list is fixed for MVP
- Do not modify the generator or template engine
- Do not raise an exception if YAML parsing fails — return a single error result with rule_id="parse_error"
- Do not add any caching or persistence of validation results

---

## Week 4 — Prompt 2 (Person A): Result Page + YamlPreview + ValidationReport

### THE TASK
Build the Result page (/result). It:
- Reads the generated YAML from WizardContext on mount
- Immediately calls POST /api/v1/validate and shows a loading state while waiting
- Renders YamlPreview (CodeMirror 6 with YAML syntax highlighting, read-only)
- Renders ValidationReport showing errors in red and warnings in amber, each with its rule_id and message
- Has three action buttons: "Download YAML" (triggers a browser file download of the YAML string),
  "Start over" (clears WizardContext and goes to /), and "Push to GitHub" (disabled if user
  is not authenticated, active otherwise — clicking calls the PR creation flow)

### BACKGROUND INFORMATION
- API call: src/api/validate.js → validateYaml(yaml) — POSTs `{ yaml: string }`
- YamlPreview: src/components/feature/YamlPreview.jsx — uses @uiw/react-codemirror with the YAML language extension
- ValidationReport: src/components/feature/ValidationReport.jsx — groups results by level
- Download: use a Blob + `URL.createObjectURL` — save as `pipeline.yml`
- "Push to GitHub" is only active if `useAuth().token` is not null
- If WizardContext has no YAML on mount (user navigated directly to /result), redirect to /

### DO NOT
- Do not allow the user to edit the YAML in CodeMirror — set it to read-only
- Do not auto-trigger PR creation — wait for the user to click the button
- Do not implement the PR creation logic yet — just show a "Connect GitHub first" tooltip if not authenticated
- Do not modify the Wizard pages

---

---

# WEEK 5 — GitHub OAuth + PR Creation

---

## Week 5 — Prompt 1 (Person B): GitHub OAuth Flow + PR Endpoint

### THE TASK
Implement GitHub OAuth and the Pull Request creation endpoint.

**OAuth (app/github_client/oauth.py + app/api/routes/auth.py):**
- GET /api/v1/auth/github: redirect the user to GitHub's OAuth authorization URL
- GET /api/v1/auth/callback: exchange the code for a GitHub access token, return it to the frontend

**PR Creation (app/github_client/repo_client.py + app/api/routes/github.py):**
- POST /api/v1/github/pr: using the user's GitHub token, create a new branch
  (`ci/add-pipeline`), commit the generated YAML as `.github/workflows/pipeline.yml`,
  and open a Pull Request. Return the PR URL and the workflow run ID.

### BACKGROUND INFORMATION
- Use Authlib for the OAuth flow — `from authlib.integrations.httpx_client import AsyncOAuth2Client`
- GitHub OAuth scopes needed: `repo` (to create branches and PRs on private repos)
- After the callback, return the token to the frontend via redirect to `{FRONTEND_URL}/auth/callback?token=...`
- repo_client.py uses PyGithub with the user's token — never with the server's token
- PR title: "ci: add generated GitHub Actions pipeline"
- PR body: include a short summary of which checks are enabled
- The workflow run ID comes from listing recent workflow runs on the repo after PR creation

### DO NOT
- Do not store the GitHub token on the backend — it lives in the frontend localStorage only
- Do not implement the polling endpoint yet — that is the next prompt
- Do not modify the detector, generator, or validator

---

## Week 5 — Prompt 2 (Person B): Status Polling Endpoint

### THE TASK
Implement the workflow run status polling endpoint.

- `poll_client.py`: given a repo URL and a workflow run ID, call the GitHub API to get the
  current run status. Return a `RunStatus` model with: run_id, status (queued/in_progress/completed),
  conclusion (success/failure/cancelled/null), jobs (list of job name + status), html_url.
- GET /api/v1/github/status/{run_id}?repo_url=...: call poll_client and return the RunStatus.

### BACKGROUND INFORMATION
- GitHub API endpoint: `GET /repos/{owner}/{repo}/actions/runs/{run_id}`
- Jobs endpoint: `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs`
- This endpoint requires the user's GitHub token — pass it as Authorization header from frontend
- Return partial results if jobs are still running — do not wait for completion server-side
- The frontend will call this endpoint every 5 seconds (handled by usePollStatus hook)

### DO NOT
- Do not implement WebSockets — simple polling is sufficient
- Do not keep any server-side state between polls
- Do not modify the PR creation endpoint

---

## Week 5 — Prompt 3 (Person A): GitHub OAuth UI + OAuthCallback + PR Button

### THE TASK
Wire the GitHub OAuth flow into the frontend.

- Update `useAuth.js`: expose `getAuthUrl()` (calls /api/v1/auth/github redirect), token state,
  and `logout()` (clears localStorage token).
- Build `OAuthCallback.jsx` (/auth/callback): reads the `?token=` param from the URL, stores it
  via useAuth, then redirects the user back to /result.
- Update the Navbar "Connect GitHub" button: if not authenticated, clicking redirects to the
  GitHub OAuth flow. If authenticated, show the user's avatar (fetched from the token) and a
  logout option.
- On the Result page, wire the "Push to GitHub" button: call src/api/github.js → createPR(repoUrl, yaml),
  then navigate to /status with the returned run_id.

### BACKGROUND INFORMATION
- GitHub token is stored in localStorage key `gh_token` via useAuth only
- src/api/auth.js: getAuthUrl() redirects to `{VITE_API_BASE_URL}/api/v1/auth/github`
- src/api/github.js: createPR(repoUrl, yaml) — POSTs to /api/v1/github/pr with Authorization header
- After createPR succeeds, store the run_id in WizardContext and navigate to /status
- If the user is not authenticated when clicking "Push to GitHub", redirect to OAuth flow first

### DO NOT
- Do not store the token anywhere except localStorage via useAuth
- Do not build the Status page yet — just navigate to /status with the run_id
- Do not modify the Wizard pages or the validation flow

---

---

# WEEK 6 — Status Tracker + Docker Compose

---

## Week 6 — Prompt 1 (Person A): Status Page + StatusTracker + usePollStatus

### THE TASK
Build the Status page (/status). It:
- Reads the run_id from WizardContext
- Uses `usePollStatus(repoUrl, runId)` hook to call GET /api/v1/github/status/{runId} every 5 seconds
- Renders StatusTracker component — a vertical list of jobs, each with a name, status icon
  (spinner for in_progress, checkmark for success, X for failure), and a link to the GitHub
  run page
- Stops polling when status is `completed`
- Shows overall conclusion (success/failure) as a banner at the top when completed
- Has a "View on GitHub" button linking to the run's html_url

### BACKGROUND INFORMATION
- `usePollStatus` hook: src/hooks/usePollStatus.js — uses setInterval + useEffect, clears interval on unmount or when status is completed
- StatusTracker: src/components/feature/StatusTracker.jsx
- API call: src/api/github.js → pollStatus(repoUrl, runId) — passes the GitHub token as Authorization header
- If run_id is missing from WizardContext, show "No active run found" and a link back to /
- Spinner, checkmark, and X icons should use Tailwind animate-spin and colored SVG icons (no external icon library)

### DO NOT
- Do not implement WebSockets — polling is sufficient
- Do not auto-redirect when the run completes — let the user stay on the page and read the results
- Do not modify the Result page or PR creation flow

---

## Week 6 — Prompt 2 (Person B): Docker Compose + Environment Setup

### THE TASK
Create the full Docker Compose setup so the entire project runs with one command.

- `backend/Dockerfile`: multi-stage build — install deps, copy app, expose port 8000
- `frontend/Dockerfile`: build React app with Vite, serve with nginx
- `docker-compose.yml`: two services (backend, frontend) with environment variable injection,
  health checks, and correct port mapping (backend: 8000, frontend: 3000)
- `docker-compose.override.yml`: dev mode with hot reload (uvicorn --reload, Vite dev server)
- Add a root-level `README.md` with setup instructions: clone, fill .env files, `docker-compose up --build`

### BACKGROUND INFORMATION
- All environment variables are defined in agent.md under "Environment Variables"
- The backend reads `.env` automatically via pydantic BaseSettings — mount it as a volume in dev
- Frontend env vars must be passed as build args in the Dockerfile (VITE_ prefix)
- Health check for backend: GET /api/v1/health (add this minimal endpoint to main.py)
- The two containers must be on the same Docker network

### DO NOT
- Do not add a database container — there is no persistence in this project
- Do not commit any .env files — add them to .gitignore
- Do not modify any application logic

---

---

# WEEK 7 — Tests + Polish

---

## Week 7 — Prompt 1 (Person B): Backend Snapshot Tests + Edge Case Fixes

### THE TASK
Write the full backend test suite.

- `test_detector.py`: test Python, Node, and Java detection with mock file contents. Use
  `unittest.mock.patch` to mock `repo_reader.read_file` — no real GitHub API calls in tests.
- `test_generator.py`: test that each of the 3 profiles (Python/Node/Java with all checks enabled)
  produces a YAML string that matches the snapshot files in `tests/snapshots/`. On first run,
  generate the snapshots. On subsequent runs, compare against them.
- `test_validator.py`: test each of the 6 custom rules independently — one test for the valid
  case (no violation) and one for the invalid case (violation detected).

### BACKGROUND INFORMATION
- Snapshot files are committed to the repo — they represent the expected correct output
- Use pytest fixtures for reusable profile objects
- If a snapshot does not match, the test fails with a clear diff message
- 3 profiles to cover: Python (FastAPI, pytest, flake8, Docker), Node (Express, jest, eslint, no Docker), Java (Spring, maven, junit, no Docker)

### DO NOT
- Do not make real network calls in any test — mock all GitHub API interactions
- Do not modify production code to make tests pass — fix tests if expectations are wrong
- Do not test the FastAPI route layer — only test the service/business logic functions

---

## Week 7 — Prompt 2 (Person A): Frontend Polish + Empty States + Error Handling

### THE TASK
Audit every page and component and add the missing states:

- Home: add a loading spinner inside the "Analyze" button while detection is running. Show a
  friendly error message if the repo is not found (404) or is private (403) with a suggestion
  to connect GitHub.
- Wizard: add a "Back" button on every step. If the user refreshes mid-wizard, show a
  "Session lost" message and a button back to Home instead of crashing.
- Result: add an empty state if validation returns no errors or warnings ("Your pipeline looks
  great!"). Add a copy-to-clipboard button next to the YAML viewer.
- Status: add a "Run not found" empty state if the run_id is invalid or the API returns 404.
- General: ensure every `catch` block in api/ functions passes a human-readable message to the
  component, not a raw Axios error object.

### BACKGROUND INFORMATION
- All error messages come from `ApiResponse.message` — extract this field in every api/ function
- The "Session lost" state should clear WizardContext and show a centered message card
- Copy-to-clipboard: use `navigator.clipboard.writeText(yaml)` — show a "Copied!" confirmation for 2s
- Back buttons update `WizardContext.currentStep` — they do not use browser history

### DO NOT
- Do not redesign any page layout — only add missing states to existing components
- Do not add any new pages or routes
- Do not install any new dependencies

---

---

# WEEK 8 — Demo Prep + Report

---

## Week 8 — Prompt 1 (Both): Final Integration Check

### THE TASK
Run through the full end-to-end flow manually for each of the 3 demo profiles and fix any
remaining issues. Then prepare 3 demo repositories on GitHub:

- `demo-python-fastapi`: a minimal FastAPI project with requirements.txt and a Dockerfile
- `demo-node-express`: a minimal Express project with package.json and jest
- `demo-java-spring`: a minimal Spring Boot project with pom.xml

Each demo repo should have NO `.github/workflows/` directory yet — so the generated PR
adds it cleanly. Verify that the full flow (detect → wizard → generate → validate → PR → status)
works for each repo.

### BACKGROUND INFORMATION
- The 3 demo repos are public so no OAuth is needed for detection
- Each repo should have enough real files for the detector to make accurate detections
- Commit the 3 generated pipeline YAML files to `tests/snapshots/` as the official snapshots

### DO NOT
- Do not add new features during integration week — only fix bugs
- Do not change the API contract

---

## Week 8 — Prompt 2 (Person B): Report Content — Architecture + Limits + Perspectives

### THE TASK
Write the technical sections of the project report as Markdown in `docs/report.md`:

1. **Architecture**: describe the 3-layer backend architecture (detector / generator / validator),
   explain the template system design decisions (why Jinja2, why file-based templates over DB),
   and include a simplified architecture diagram description.

2. **Validation design**: explain why yamllint + custom rules were separated, describe each of
   the 6 rules and why it matters for CI quality.

3. **Limits**: honestly describe what the tool does not handle — private repos without OAuth,
   monorepos with multiple languages, GitLab CI, advanced matrix strategies, deploy to cloud.

4. **Perspectives**: list 3–5 realistic extensions — GitLab CI support, YAML repair mode,
   policy engine (SAST/SBOM requirements), AI-assisted rule suggestions.

### DO NOT
- Do not write the user guide — that is Person A's task
- Do not pad the report with generic CI/CD theory — focus on the project's specific decisions

---

## Week 8 — Prompt 3 (Person A): User Guide

### THE TASK
Write `docs/user-guide.md` — a practical guide for someone using the tool for the first time.
Cover: what the tool does (one paragraph), prerequisites (GitHub account, public repo),
the step-by-step wizard walkthrough with screenshots described as image placeholders,
how to interpret the validation report, how to merge the generated PR, and an FAQ section
with the 5 most likely questions (wrong detection, private repo, re-generating, unsupported language, etc.).

### DO NOT
- Do not duplicate content from the README
- Do not write about internal architecture — this is an end-user document

---

---

# General Rules for All Prompts

These apply to every single prompt you send to Claude throughout the project.

1. **Always load agent.md first.** Paste it at the top of every new chat session before any prompt.

2. **One prompt = one feature.** Do not ask Claude to build multiple modules in one go. Small,
   focused prompts produce cleaner code.

3. **Reference agent.md explicitly.** Say "as defined in agent.md" when referring to structure,
   conventions, or rules. This anchors Claude to your decisions.

4. **After each prompt, ask Claude to list what it changed.** Say: "List every file you created
   or modified and what you changed in each." This keeps you in control.

5. **Use the Do Not section seriously.** If Claude has a tendency to refactor something it should
   not touch, add it explicitly to the Do Not section of your next prompt.

6. **When something breaks, paste the error + the relevant file.** Say: "Do not rewrite the whole
   file — identify the issue and fix only the broken part."

7. **At the end of each week, update agent.md.** Add any new endpoints, new components, or new
   rules that came up during that week. This keeps the memory accurate.

8. **Split prompts by person.** Each prompt is labeled (Person A) or (Person B). Do not mix
   both tracks in one prompt — it leads to tangled code with unclear ownership.
