# Feature Request: CI/CD Workflow Generator — Enhancement Batch

> Use this document as a complete specification to implement the following improvements to the CI/CD Workflow Generator project. All changes must respect the existing architecture, naming conventions, and coding rules defined in `agent.md`.

---

## 1. Multi-Language Detection & Multi-Language Pipeline Generation

### Problem
The current detector assumes a single language per repository and the generator only selects one template per run. Monorepos and fullstack projects (e.g. a Python backend + Node.js frontend in the same repo) produce broken or incomplete YAML when analyzed.

### Backend changes

**`detector/stack_detector.py`**
- Change the return type from a single `DetectedStack` model to `List[DetectedStack]` — one entry per detected language/sub-project.
- Detection should be path-aware: if `backend/requirements.txt` and `frontend/package.json` both exist, produce two separate stack entries with their respective `root_path` fields set.
- The `repo_reader.py` file tree scan must collect all recognized manifest files, not just the first match.

**`generator/pipeline_builder.py`**
- Accept `List[ProjectProfile]` instead of a single `ProjectProfile`.
- For each profile, select and render the appropriate template.
- Merge all rendered job blocks into a single YAML document under a single `on:` trigger section, deduplicating shared triggers.
- Job names must be namespaced per language to avoid key collisions (e.g. `test-python`, `test-node`).

**`generator/models.py`**
- Add a `root_path: Optional[str]` field to `ProjectProfile` — used as the working directory in rendered steps.
- `GeneratedPipeline` gains a `source_profiles: List[ProjectProfile]` field for traceability.

**`api/routes/generate.py`**
- Update the request body to accept `profiles: List[ProjectProfile]` (a list, not a single object).
- Response shape stays the same: `{ yaml, template_used }` — `template_used` becomes a comma-separated list.

**`api/routes/detect.py`**
- Response `data` field changes from a single object to `{ stacks: List[DetectedStack] }`.

### Frontend changes

**`WizardContext.jsx`**
- `detectedStack` state becomes `detectedStacks: DetectedStack[]`.
- The profile built in Step 3–4 becomes `profiles: ProjectProfile[]`, one per detected stack.
- Expose helpers: `addStack()`, `removeStack(index)`, `updateStack(index, partial)`.

**`StackSummary.jsx`**
- Render one card per detected stack instead of a single form.
- Each card is independently editable (language, version, framework, test framework, linter).
- A user can remove a stack card (e.g. remove the Java entry if it was a false positive).
- A "Add language manually" button appends a blank stack card.

---

## 2. Expanded Language, Framework, and Test Runner Support

### New languages to detect and support (add to `stack_detector.py`, parsers, and templates)

| Language | Detection file(s) | New template(s) |
|---|---|---|
| Go | `go.mod` | `go_test.yml.j2` |
| Rust | `Cargo.toml` | `rust_test.yml.j2` |
| PHP | `composer.json` | `php_test.yml.j2` |
| Ruby | `Gemfile` | `ruby_test.yml.j2` |
| C# / .NET | `*.csproj`, `*.sln` | `dotnet_test.yml.j2` |
| Swift | `Package.swift` | `swift_test.yml.j2` |
| Kotlin | `build.gradle.kts` | `kotlin_gradle_test.yml.j2` |

Create a parser file per new language in `detector/parsers/` following the same interface as the existing parsers.

### New frameworks to detect per language

| Language | Additional frameworks to detect |
|---|---|
| Python | Django, Flask, FastAPI (already present), Celery, Scrapy |
| Node.js | Next.js, NestJS, Express, Nuxt, Remix, Astro |
| Java | Spring Boot, Quarkus, Micronaut (Gradle + Maven variants) |
| Go | Gin, Echo, Fiber |
| PHP | Laravel, Symfony, Slim |
| Ruby | Rails, Sinatra |

Detection is file/manifest based — check `package.json` dependencies for Node, `pyproject.toml` / `requirements.txt` for Python, etc.

### New test frameworks to detect and support

| Language | Test frameworks |
|---|---|
| Python | pytest (existing), unittest, tox, coverage.py |
| Node.js | jest (existing), vitest (existing), mocha, cypress, playwright |
| Java | JUnit 5, TestNG, Mockito (detected via `pom.xml` / `build.gradle`) |
| Go | native `go test`, testify |
| PHP | PHPUnit |
| Ruby | RSpec, Minitest |
| C# | xUnit, NUnit, MSTest |

Add `test_framework` and `test_command` resolution logic per new language in their respective parsers.

### Frontend sync

Update `src/utils/constants.js`:
- `SUPPORTED_LANGUAGES`: add all new language entries.
- Add `SUPPORTED_FRAMEWORKS` map keyed by language.
- Add `SUPPORTED_TEST_FRAMEWORKS` map keyed by language.

The `StackSummary.jsx` dropdowns for language, framework, and test framework should be populated from these constants.

---

## 3. New CI Check Classes

Add the following check IDs to `CHECK_OPTIONS` in both `src/utils/constants.js` (frontend) and the backend constants file. Implement the corresponding template logic.

| Check ID | Label | Description | Template block |
|---|---|---|---|
| `code_coverage` | Code Coverage | Fail if coverage drops below a threshold (configurable %) | Added as a post-test step in language templates |
| `static_analysis` | Static Analysis | Run sonarqube-scan-action or equivalent | `static_analysis.yml.j2` |
| `dependency_audit` | Dependency Audit | `pip-audit` / `npm audit` / `bundle audit` | Inline step added per language |
| `license_check` | License Check | Run `license-checker` / `pip-licenses` | Inline step |
| `release` | Release / Publish | Publish to PyPI, npm, GitHub Releases, Docker Hub | `release.yml.j2` |
| `notify` | Notifications | Slack/Teams webhook on success or failure | `notify.yml.j2` (job-level `if:` blocks) |
| `e2e` | E2E Tests | Run Playwright or Cypress against a running service | `e2e_tests.yml.j2` |
| `performance` | Performance Tests | Lighthouse CI or k6 load test | `perf_tests.yml.j2` |

Add corresponding validation rules in `backend/app/validator/rules/`:
- `coverage_threshold_rule.py`: warn if `code_coverage` check is enabled but no threshold is set.
- `release_auth_rule.py`: error if `release` check is enabled without a secrets reference.

---

## 4. Build Matrix Support

### Problem
Generated templates run on a single OS and runtime version. There is no way to test across multiple platforms or runtime versions simultaneously.

### Backend changes

**`generator/models.py`**
Add an optional `matrix: Optional[MatrixConfig]` field to `ProjectProfile`:

```python
class MatrixConfig(BaseModel):
    os: List[str] = ["ubuntu-latest"]          # e.g. ["ubuntu-latest", "windows-latest", "macos-latest"]
    versions: List[str] = []                    # e.g. ["3.10", "3.11", "3.12"] for Python
    fail_fast: bool = False
    include: List[dict] = []                    # explicit matrix include entries
    exclude: List[dict] = []                    # explicit matrix exclude entries
```

**All templates** — add a conditional matrix block to every language template:

```jinja2
{% if matrix and (matrix.os | length > 1 or matrix.versions | length > 1) %}
    strategy:
      fail-fast: {{ matrix.fail_fast | lower }}
      matrix:
        os: {{ matrix.os | tojson }}
        {{ language }}-version: {{ matrix.versions | tojson }}
        {% if matrix.include %}include: {{ matrix.include | tojson }}{% endif %}
        {% if matrix.exclude %}exclude: {{ matrix.exclude | tojson }}{% endif %}
    runs-on: ${{ "{{" }} matrix.os {{ "}}" }}
{% else %}
    runs-on: ubuntu-latest
{% endif %}
```

For the runtime version step, replace the hardcoded version pin with `${{ "{{" }} matrix.{{ language }}-version {{ "}}" }}` when matrix is active.

### Frontend changes

**`CheckSelector.jsx` or a new `MatrixConfig.jsx` component**
Add a collapsible "Matrix Configuration" panel (shown only when at least one language stack is detected). The panel contains:
- A multi-select for target OS: `ubuntu-latest`, `windows-latest`, `macos-latest`.
- A tag input for runtime versions (e.g. `3.10`, `3.11`, `3.12`).
- A `fail-fast` toggle.
- An "Advanced: include/exclude" expandable section with a raw JSON textarea.

Store this in `WizardContext` as `matrixConfig` and pass it through to the `ProjectProfile` sent to `/generate`.

---

## 5. Editable YAML with Re-validation

### Problem
`YamlPreview.jsx` is currently read-only. Users cannot make manual adjustments to the generated YAML before committing or opening a PR, and cannot re-run validation after edits.

### Frontend changes

**`YamlPreview.jsx`**
- Add an `editable` prop (default `false`). When `true`, switch CodeMirror 6 from read-only mode to editable mode.
- The component must call an `onChange(newYaml)` callback on every content change, debounced at 500 ms.
- Maintain two internal states: `savedYaml` (last validated/generated) and `draftYaml` (current editor content).
- Show a visual indicator (e.g. a yellow dot or "Unsaved changes" badge) when `draftYaml !== savedYaml`.

**`Result.jsx`**
- Add an "Edit YAML" toggle button next to the current action buttons. Clicking it sets `editable={true}` on `YamlPreview`.
- While in edit mode, show a "Re-validate" button. Clicking it:
  1. Calls `validateYaml(draftYaml)` via `src/api/validate.js`.
  2. Updates the `ValidationReport` panel with the new results.
  3. If validation passes with no errors, enables the "Open PR" button.
  4. Sets `savedYaml = draftYaml`.
- While in edit mode, show a "Reset to generated" button that restores `draftYaml` to the originally generated YAML.
- Disable the "Open PR" button whenever `draftYaml !== savedYaml` (force re-validation before PR).

**`ValidationReport.jsx`**
- Accept a `stale: boolean` prop. When `true` (i.e. YAML has been edited since last validation), display a banner: *"YAML has changed — re-validate to see current results."*

### Backend — no changes required
`POST /api/v1/validate` already accepts any YAML string — it will work as-is for re-validation.

---

## Validation Rules to Add (covers all above features)

Add to `backend/app/validator/rules/`:

| File | Rule ID | Level | Description |
|---|---|---|---|
| `matrix_rules.py` | `matrix_os_mismatch` | WARNING | Matrix OS includes `windows-latest` but shell commands use bash syntax |
| `matrix_rules.py` | `matrix_version_empty` | WARNING | Matrix config present but versions list is empty |
| `coverage_rules.py` | `coverage_threshold_missing` | WARNING | Coverage check enabled but no threshold configured |
| `release_rules.py` | `release_missing_secret` | ERROR | Release job has no `${{ secrets.* }}` reference for auth |
| `multistack_rules.py` | `duplicate_job_names` | ERROR | Two jobs share the same `id` after multi-stack merge |

---

## Constants to Keep in Sync

After implementing the above, verify the following are consistent between backend and frontend:

- `CHECK_OPTIONS` (all new check IDs present in both)
- `SUPPORTED_LANGUAGES` (all 10+ languages present)
- `SUPPORTED_FRAMEWORKS` (keyed by language)
- `SUPPORTED_TEST_FRAMEWORKS` (keyed by language)
- Validation rule IDs referenced in `formatValidation.js` display map

---

## Testing Requirements

**Backend (`tests/`)**
- `test_detector.py`: add test cases for monorepo detection (two manifest files at different paths), each new language, and the `List[DetectedStack]` return shape.
- `test_generator.py`: add test for multi-profile input producing a merged YAML with namespaced jobs; add matrix snapshot tests.
- `test_validator.py`: add tests for all new validation rules.
- `snapshots/`: add `multistack_python_node.yml`, `go_profile.yml`, `matrix_python.yml` snapshot files.

**Frontend (`src/`)**
- Add Vitest unit tests for `StackSummary` rendering multiple cards.
- Add tests for the `editable` mode toggle and re-validation flow in `Result.jsx`.
- Add tests for `MatrixConfig` component input handling.

---

## Commit Guidance

Follow the existing branch and commit conventions:

```
feature/week{N}-multi-language-detection
feature/week{N}-matrix-support
feature/week{N}-yaml-editor

[Week N] Add multi-language detection and merged pipeline generation
[Week N] Add build matrix support to all templates
[Week N] Make YamlPreview editable with re-validation flow
[Week N] Add Go, Rust, PHP, Ruby, C# language support
[Week N] Add 8 new CI check classes and validation rules
```
