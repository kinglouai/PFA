# CI/CD Workflow Generator — User Guide

Welcome to the **CI/CD Workflow Generator**! This guide will help you understand how to use the tool to analyze your codebase, customize a continuous integration pipeline, validate its structure, and push it directly to your GitHub repository as a Pull Request.

---

## What the Tool Does

The CI/CD Workflow Generator is an interactive developer tool designed to simplify CI/CD setup. By analyzing your public or private GitHub repository, the tool automatically detects your project's programming language, package manager, frameworks, test setups, and linting configurations. It then guides you through a customization wizard to choose the CI checks you want, generates a production-ready GitHub Actions workflow, validates it against syntax and security best practices, and automatically opens a Pull Request on your repository with the finalized pipeline.

---

## Prerequisites

Before using the tool, ensure you have the following:
1. **GitHub Account**: A valid GitHub account to authenticate with the application.
2. **Target Repository**: A GitHub repository (either public or private) containing a project codebase with manifest files (such as `requirements.txt`, `package.json`, or `pom.xml`).
3. **Write Access**: For private repositories or to use the "Push to GitHub" feature, you must authorize the application via the GitHub OAuth login flow.

---

## Step-by-Step Walkthrough

### Step 1: Repository Analysis
Navigate to the home page. Enter your GitHub repository URL (e.g., `https://github.com/username/my-project`) into the input box and click **Analyze**. The system will scan your repository structure in real time.

![Repository Input Screen](placeholder_image_home_page.png)

### Step 2: Stack Confirmation
The tool displays a summary of the detected components (such as language version, test runner, and linter). If the detection missed a version or if you want to override a setting, click the **Edit** button next to any property, make the correction, and click **Looks good →** to proceed.

![Confirm Detected Stack](placeholder_image_stack_summary.png)

### Step 3: CI/CD Checks Selection
Toggle the switches to enable or disable specific features of your pipeline:
- **Linting**: Runs style and syntax checkers.
- **Tests**: Executes your unit tests.
- **Docker build**: Builds and verifies the Docker image.
- **Security scan**: Runs code scans.
- **Dependency cache**: Caches packages to speed up future runs.
- **Deploy (simulated)**: Adds a placeholder deploy step.

Click **Generate Pipeline →** to build the workflow.

![Select Pipeline Checks](placeholder_image_check_selector.png)

### Step 4: Preview & Validate
The generated workflow YAML is rendered in a high-fidelity code viewer. The system automatically runs a validation suite and highlights any warnings or errors. If there are no issues, a green confirmation banner is shown.

![YAML Preview & Validation](placeholder_image_yaml_preview.png)

### Step 5: Push & Monitor
Click **Push to GitHub** (authenticate first if you haven't). The app will create a branch named `ci/add-pipeline`, commit your workflow file as `.github/workflows/pipeline.yml`, and open a Pull Request. The page redirects to a live tracker showing the GitHub Actions pipeline execution progress.

![Live Status Tracker](placeholder_image_status_tracker.png)

---

## Understanding the Validation Report

The validation report evaluates your generated pipeline against two layers of rules:
- **Errors (Red)**: Syntactic or structural failures that must be resolved. For example, a deploy job running before your tests, or plain-text credentials found in the file.
- **Warnings (Orange)**: Recommendations that improve quality but do not block execution, such as missing dependency caching or lack of step timeouts.

If you see:
- `Your pipeline looks great!`: Your workflow complies with all best practices and is ready for use.

---

## Merging the Generated Pull Request

Once the Pull Request is created by the tool:
1. Click the **View on GitHub** link on the Status page to navigate directly to the Pull Request.
2. Verify that the GitHub Actions checks successfully complete on the PR.
3. Review the code changes (it will contain exactly one new file: `.github/workflows/pipeline.yml`).
4. Click **Merge pull request** and confirm. The pipeline is now active on your main branch and will trigger automatically on future commits!

---

## Frequently Asked Questions (FAQ)

### 1. The tool detected the wrong language or framework version. How can I fix this?
On **Step 2 (Stack Confirmation)** of the wizard, you can click the **Edit** button next to any detected field. This allows you to manually correct or customize the programming language, framework, linter, or version before generating the pipeline.

### 2. Can I run the tool on a private repository?
Yes. To analyze a private repository, you must first link your GitHub account using the **Connect GitHub** button in the navbar. This grants the tool temporary, secure permission to read your repository file tree.

### 3. How do I re-generate a pipeline if I want different checks?
You can navigate back in the wizard using the **Back** button on any step to adjust your check selections or stack configuration. Alternatively, click **Start over** on the Results page to begin with a new repository URL.

### 4. What happens if my language/framework is not supported?
Currently, the tool supports **Python** (FastAPI, Flask, Django), **Node.js** (Express, Next.js, Vite), and **Java** (Spring Boot). If you submit an unsupported project, it will be marked as `unknown`. You can still write custom actions, but we recommend checking our release logs as support for more stacks is added.

### 5. Does the tool store my codebase or credentials?
No. The backend processes your repository configuration strictly in-memory during detection. The OAuth tokens are stored exclusively in your browser's local storage and are never stored on our server database.
