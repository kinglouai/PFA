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
 */
export const WIZARD_STEPS = [
  'Repo Input',
  'Stack Confirm',
  'Select Checks',
  'Generate',
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
