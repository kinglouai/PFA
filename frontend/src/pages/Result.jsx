/**
 * Result page — YAML preview + actions.
 * Shows the generated pipeline YAML.
 */
import { useNavigate } from 'react-router-dom'
import { useWizard } from '../context/WizardContext.jsx'
import PageWrapper from '../components/layout/PageWrapper.jsx'
import YamlPreview from '../components/feature/YamlPreview.jsx'
import Button from '../components/ui/Button.jsx'

export default function Result() {
  const { state, dispatch } = useWizard()
  const navigate = useNavigate()

  // Redirect if no generated YAML
  if (!state.generatedYaml) {
    return (
      <PageWrapper>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          <div className="text-center">
            <p className="text-[var(--color-text-secondary)] mb-4">
              No pipeline generated yet.
            </p>
            <Button onClick={() => navigate('/')}>
              ← Back to Home
            </Button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const handleDownload = () => {
    const blob = new Blob([state.generatedYaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ci.yml'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageWrapper>
      <div className="flex-1 flex flex-col px-6 py-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Pipeline Generated
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Your CI/CD Pipeline
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            Template used: <span className="text-indigo-400 font-mono">{state.templateUsed}</span>
          </p>
        </div>

        {/* YAML Preview */}
        <div className="mb-6 animate-slide-up">
          <YamlPreview yaml={state.generatedYaml} />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Button
            id="download-yaml-btn"
            onClick={handleDownload}
            variant="primary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download YAML
          </Button>

          <Button
            id="create-pr-btn"
            variant="secondary"
            disabled
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Open PR (Coming soon)
          </Button>

          <Button
            id="start-over-btn"
            variant="ghost"
            onClick={() => { dispatch({ type: 'RESET' }); navigate('/') }}
          >
            ← Start Over
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}
