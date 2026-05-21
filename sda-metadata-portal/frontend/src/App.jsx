import PropTypes from 'prop-types'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import DiscoveryPage from './pages/DiscoveryPage'
import DatasetDetailPage from './pages/DatasetDetailPage'
import RegisterPage from './pages/RegisterPage'

function AppShell({ children }) {
  const location = useLocation()
  const isRegisterRoute = location.pathname === '/datasets/new'

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <div>
            <h1>State Data Authority of Uttar Pradesh</h1>
          </div>
          {!isRegisterRoute && (
            <Link to="/datasets/new" className="primary-link">
              Create New Dataset
            </Link>
          )}
        </div>
      </header>

      <main className="main">{children}</main>
    </div>
  )
}

AppShell.propTypes = {
  children: PropTypes.node.isRequired,
}

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DiscoveryPage />} />
        <Route path="/datasets/new" element={<RegisterPage />} />
        <Route path="/datasets/:id" element={<DatasetDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
