/**
 * CHECK_OPTIONS — list of available CI checks.
 * Keep in sync with backend constants.
 */
export const CHECK_OPTIONS = [
  {
    id: 'lint',
    label: 'Linting',
    description: 'Run linter (flake8, eslint, checkstyle)',
    icon: '🔍',
  },
  {
    id: 'test',
    label: 'Tests',
    description: 'Run test suite',
    icon: '🧪',
  },
  {
    id: 'docker',
    label: 'Docker Build',
    description: 'Build Docker image',
    icon: '🐳',
  },
  {
    id: 'security',
    label: 'Security Scan',
    description: 'Run Trivy or CodeQL',
    icon: '🛡️',
  },
  {
    id: 'cache',
    label: 'Dependency Cache',
    description: 'Cache pip/npm/maven dependencies',
    icon: '📦',
  },
  {
    id: 'deploy_sim',
    label: 'Deploy (simulated)',
    description: 'Echo deploy step, requires test to pass',
    icon: '🚀',
  },
]

/**
 * SUPPORTED_LANGUAGES — languages the detector supports.
 */
export const SUPPORTED_LANGUAGES = ['python', 'node', 'java']

/**
 * WIZARD_STEPS — labels for the wizard stepper.
 * Step 5 added: "Push & Test on GitHub"
 */
export const WIZARD_STEPS = [
  'Repo Input',
  'Stack Confirm',
  'Select Checks',
  'Generate',
  'Push & Test',
]

/**
 * Language colors for Tag component.
 */
export const LANGUAGE_COLORS = {
  python: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  node: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  java: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  unknown: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
}

/**
 * STACK_FIELD_OPTIONS — valid options for each stack field dropdown.
 * Used by StackSummary to replace free-text inputs with selectors.
 */
export const STACK_FIELD_OPTIONS = {
  language: ['python', 'node', 'java'],
  version: {
    python: ['3.8', '3.9', '3.10', '3.11', '3.12', '3.13'],
    node: ['16', '18', '20', '22'],
    java: ['8', '11', '17', '21'],
  },
  framework: {
    python: ['fastapi', 'flask', 'django', 'none'],
    node: ['express', 'next', 'vite', 'nest', 'none'],
    java: ['spring', 'quarkus', 'none'],
  },
  test_framework: {
    python: ['pytest', 'unittest', 'none'],
    node: ['jest', 'vitest', 'mocha', 'none'],
    java: ['junit', 'testng', 'none'],
  },
  linter: {
    python: ['flake8', 'black', 'pylint', 'ruff', 'none'],
    node: ['eslint', 'prettier', 'biome', 'none'],
    java: ['checkstyle', 'spotbugs', 'none'],
  },
  package_manager: {
    python: ['pip', 'poetry', 'pipenv'],
    node: ['npm', 'yarn', 'pnpm'],
    java: ['maven', 'gradle'],
  },
}
