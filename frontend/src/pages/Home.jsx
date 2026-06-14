/**
 * Home page — landing page with repo URL input.
 * Redesigned to match the Stitch AI template aesthetic.
 */
import PageWrapper from '../components/layout/PageWrapper.jsx'
import RepoInput from '../components/feature/RepoInput.jsx'

const TECH_STACK = [
  { name: 'Python', dotColor: 'bg-[#00d2ff]' },
  { name: 'Node.js', dotColor: 'bg-green-500' },
  { name: 'Java', dotColor: 'bg-red-500' },
  { name: 'Go', dotColor: 'bg-blue-400' },
  { name: 'Rust', dotColor: 'bg-orange-500' },
  { name: 'PHP', dotColor: 'bg-purple-500' },
  { name: 'Ruby', dotColor: 'bg-red-600' },
  { name: '.NET', dotColor: 'bg-purple-600' },
  { name: 'Swift', dotColor: 'bg-orange-600' },
  { name: 'Kotlin', dotColor: 'bg-purple-400' },
  { name: 'React', dotColor: 'bg-cyan-400' },
  { name: 'Vue', dotColor: 'bg-green-400' },
  { name: 'Angular', dotColor: 'bg-red-500' },
  { name: 'Laravel', dotColor: 'bg-red-400' },
  { name: 'Spring Boot', dotColor: 'bg-green-600' },
  { name: 'Docker', dotColor: 'bg-blue-500' },
]

export default function Home() {
  return (
    <PageWrapper>
      {/* Ambient glow effects */}
      <div className="ambient-glow-left"></div>
      <div className="ambient-glow-right"></div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10" style={{ paddingTop: '120px', paddingBottom: '96px' }}>
        <div className="max-w-4xl w-full text-center" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Hero Headers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1
              className="animate-fade-in"
              style={{
                fontFamily: 'Geist, Inter, system-ui, sans-serif',
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: '#dde3e7',
              }}
            >
              Generate CI/CD pipelines <br className="hidden md:block" /> in seconds
            </h1>
            <p
              className="animate-fade-in"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#bbc9cf',
                maxWidth: '42rem',
                margin: '0 auto',
                animationDelay: '0.1s',
              }}
            >
              Paste your GitHub repo URL and get a production-ready GitHub Actions workflow, tailored to your stack.
            </p>
          </div>

          {/* Repo input with glowing container */}
          <div className="animate-fade-in" style={{ maxWidth: '42rem', margin: '48px auto 0', width: '100%', animationDelay: '0.2s' }}>
            <RepoInput />
          </div>

          {/* Tech Stack Grid */}
          <div className="animate-fade-in" style={{ marginTop: '96px', paddingTop: '48px', animationDelay: '0.3s' }}>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              lineHeight: 1.2,
              letterSpacing: '0.1em',
              fontWeight: 500,
              color: '#859399',
              textTransform: 'uppercase',
              marginBottom: '32px',
            }}>
              Supported Languages & Frameworks
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', maxWidth: '56rem', margin: '0 auto' }}>
              {TECH_STACK.map((tech) => (
                <div key={tech.name} className="glass-badge" style={{ borderRadius: '8px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
                  <span className={tech.dotColor} style={{ width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }}></span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', lineHeight: 1.5, color: '#dde3e7' }}>
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={{
        width: '100%',
        padding: '48px 24px',
        borderTop: '1px solid rgba(60, 73, 78, 0.2)',
        position: 'relative',
        zIndex: 10,
        backgroundColor: '#0e1417',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '1440px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'Geist, Inter, system-ui, sans-serif', fontSize: '24px', fontWeight: 600, color: '#dde3e7' }}>
            PipelineGen
          </div>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px', color: '#bbc9cf' }}>
            © 2024 PipelineGen. Engineered for Excellence.
          </div>
        </div>
      </footer>
    </PageWrapper>
  )
}
