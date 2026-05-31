/**
 * Home page — landing page with repo URL input.
 */
import PageWrapper from '../components/layout/PageWrapper.jsx'
import RepoInput from '../components/feature/RepoInput.jsx'

export default function Home() {
  return (
    <PageWrapper>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* Hero section */}
        <div className="text-center mb-12 animate-fade-in flex flex-col items-center">
          {/* Logo image in place of badge */}
          <img
            src="/logo.png"
            alt="PipelineGen"
            className="h-50 w-auto object-contain mx-auto mb-3 animate-fade-in"
          />

          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] leading-tight mb-4 flex flex-col items-center">
            Generate CI/CD pipelines
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              in seconds
            </span>
          </h1>

          <p className="text-lg text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed flex flex-col items-center">
            Paste your GitHub repo URL and get a production-ready
            GitHub Actions workflow, tailored to your stack.
          </p>
        </div>

        {/* Repo input */}
        <RepoInput />

        {/* Supported badges */}
        <div className="mt-16 flex items-center gap-6 text-[var(--color-text-muted)] animate-fade-in " style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs">🐍</div>
            Python
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center text-green-400 text-xs">⬢</div>
            Node.js
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-md bg-orange-500/10 flex items-center justify-center text-orange-400 text-xs">☕</div>
            Java
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
