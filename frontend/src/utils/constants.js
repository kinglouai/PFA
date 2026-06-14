/**
 * CHECK_OPTIONS — list of available CI checks.
 * Keep in sync with backend constants.
 */
export const CHECK_OPTIONS = [
  {
    id: 'lint',
    label: 'Linting',
    description: 'Analyze source code to flag programming errors, bugs, and stylistic errors.',
    icon: '🔍',
    materialIcon: 'code_blocks',
  },
  {
    id: 'test',
    label: 'Tests',
    description: 'Execute unit, integration, and end-to-end test suites automatically.',
    icon: '🧪',
    materialIcon: 'science',
  },
  {
    id: 'docker',
    label: 'Docker Build',
    description: 'Build and validate Docker container images to ensure consistency.',
    icon: '🐳',
    materialIcon: 'deployed_code',
  },
  {
    id: 'security',
    label: 'Security Scan',
    description: 'Perform SAST and DAST scanning to identify vulnerabilities early.',
    icon: '🛡️',
    materialIcon: 'security',
  },
  {
    id: 'cache',
    label: 'Dependency Cache',
    description: 'Cache dependencies to significantly speed up build times across runs.',
    icon: '📦',
    materialIcon: 'inventory_2',
  },
  {
    id: 'deploy_sim',
    label: 'Deploy (simulated)',
    description: 'Run a dry-run deployment to verify infrastructure logic without modifying production.',
    icon: '🚀',
    materialIcon: 'rocket_launch',
  },
  {
    id: 'code_coverage',
    label: 'Code Coverage',
    description: 'Generate and upload coverage reports to track tested code percentage.',
    icon: '📊',
    materialIcon: 'insert_chart',
  },
  {
    id: 'static_analysis',
    label: 'Static Analysis',
    description: 'Deep code analysis for complexity, maintainability, and potential bugs.',
    icon: '🔬',
    materialIcon: 'find_in_page',
  },
  {
    id: 'dependency_audit',
    label: 'Dependency Audit',
    description: 'Scan dependencies for known security vulnerabilities and outdated packages.',
    icon: '🔐',
    materialIcon: 'shield_lock',
  },
  {
    id: 'license_check',
    label: 'License Check',
    description: 'Verify open-source license compliance across all project dependencies.',
    icon: '📜',
    materialIcon: 'gavel',
  },
  {
    id: 'release',
    label: 'Release / Publish',
    description: 'Publish artifacts to PyPI, npm, GitHub Releases, or container registries.',
    icon: '📤',
    materialIcon: 'publish',
  },
  {
    id: 'notify',
    label: 'Notifications',
    description: 'Send Slack or Teams webhook alerts on pipeline success or failure.',
    icon: '🔔',
    materialIcon: 'notifications',
  },
  {
    id: 'e2e',
    label: 'E2E Tests',
    description: 'Run Playwright or Cypress browser-based end-to-end tests.',
    icon: '🎭',
    materialIcon: 'web',
  },
  {
    id: 'performance',
    label: 'Performance Tests',
    description: 'Run Lighthouse CI or k6 load tests to catch performance regressions.',
    icon: '⚡',
    materialIcon: 'speed',
  },
]

/**
 * SUPPORTED_LANGUAGES — languages the detector supports.
 */
export const SUPPORTED_LANGUAGES = [
  'python', 'node', 'java', 'go', 'rust', 'php', 'ruby', 'dotnet', 'swift', 'kotlin',
]

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
  go: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  rust: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  php: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
  ruby: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
  dotnet: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  swift: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  kotlin: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  unknown: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
}

/**
 * STACK_FIELD_OPTIONS — valid options for each stack field dropdown.
 * Used by StackSummary to replace free-text inputs with selectors.
 */
export const STACK_FIELD_OPTIONS = {
  language: ['python', 'node', 'java', 'go', 'rust', 'php', 'ruby', 'dotnet', 'swift', 'kotlin'],
  version: {
    python: ['3.8', '3.9', '3.10', '3.11', '3.12', '3.13'],
    node: ['16', '18', '20', '22'],
    java: ['8', '11', '17', '21'],
    go: ['1.20', '1.21', '1.22', '1.23'],
    rust: ['stable', '1.75', '1.76', '1.77', '1.78'],
    php: ['8.0', '8.1', '8.2', '8.3'],
    ruby: ['3.0', '3.1', '3.2', '3.3'],
    dotnet: ['6.0', '7.0', '8.0', '9.0'],
    swift: ['5.8', '5.9', '5.10'],
    kotlin: ['8', '11', '17', '21'],
  },
  framework: {
    python: ['fastapi', 'flask', 'django', 'none'],
    node: ['react', 'vue', 'angular', 'express', 'next', 'vite', 'nest', 'nuxt', 'remix', 'astro', 'none'],
    java: ['spring-boot', 'spring', 'quarkus', 'micronaut', 'none'],
    go: ['gin', 'echo', 'fiber', 'none'],
    rust: ['actix-web', 'rocket', 'axum', 'warp', 'none'],
    php: ['laravel', 'symfony', 'slim', 'none'],
    ruby: ['rails', 'sinatra', 'hanami', 'none'],
    dotnet: ['aspnet', 'maui', 'none'],
    swift: ['vapor', 'kitura', 'none'],
    kotlin: ['spring', 'ktor', 'none'],
  },
  test_framework: {
    python: ['pytest', 'unittest', 'tox', 'none'],
    node: ['jest', 'vitest', 'mocha', 'cypress', 'playwright', 'none'],
    java: ['junit', 'junit5', 'testng', 'none'],
    go: ['go test', 'testify', 'none'],
    rust: ['cargo test', 'none'],
    php: ['phpunit', 'pest', 'none'],
    ruby: ['rspec', 'minitest', 'none'],
    dotnet: ['xunit', 'nunit', 'mstest', 'none'],
    swift: ['xctest', 'none'],
    kotlin: ['junit', 'junit5', 'kotest', 'none'],
  },
  linter: {
    python: ['flake8', 'black', 'pylint', 'ruff', 'none'],
    node: ['eslint', 'prettier', 'biome', 'none'],
    java: ['checkstyle', 'spotbugs', 'none'],
    go: ['golangci-lint', 'none'],
    rust: ['clippy', 'none'],
    php: ['phpcs', 'php-cs-fixer', 'none'],
    ruby: ['rubocop', 'none'],
    dotnet: ['dotnet-format', 'none'],
    swift: ['swiftlint', 'none'],
    kotlin: ['ktlint', 'detekt', 'none'],
  },
  package_manager: {
    python: ['pip', 'poetry', 'pipenv'],
    node: ['npm', 'yarn', 'pnpm'],
    java: ['maven', 'gradle'],
    go: ['go modules'],
    rust: ['cargo'],
    php: ['composer'],
    ruby: ['bundler'],
    dotnet: ['nuget'],
    swift: ['spm'],
    kotlin: ['gradle'],
  },
}
