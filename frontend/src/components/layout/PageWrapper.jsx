/**
 * PageWrapper — wraps all pages with Navbar and main content area.
 */
import Navbar from './Navbar.jsx'

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
