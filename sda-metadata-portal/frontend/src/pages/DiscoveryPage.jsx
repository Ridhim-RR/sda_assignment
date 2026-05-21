import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DatasetCard from '../components/DatasetCard'
import DatasetFilters from '../components/DatasetFilters'

const API_BASE = import.meta.env.VITE_API_BASE

const INITIAL_FILTERS = {
  search: '',
  sector: '',
  classification: '',
}

export default function DiscoveryPage() {
  const navigate = useNavigate()

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [datasets, setDatasets] = useState([])
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadSectors() {
      try {
        const res = await fetch(`${API_BASE}/api/sectors`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load sectors')
        if (isMounted) {
          setSectors(data)
        }
      } catch {
        if (isMounted) {
          setSectors([])
        }
      }
    }

    loadSectors()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadDatasets() {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams()
        if (filters.search?.trim()) params.set('search', filters.search.trim())
        if (filters.sector) params.set('sector', filters.sector)
        if (filters.classification) params.set('classification', filters.classification)
        const query = params.toString()
        const url = query ? `${API_BASE}/api/datasets?${query}` : `${API_BASE}/api/datasets`
        const res = await fetch(url)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load datasets')
        if (isMounted) {
          setDatasets(data)
        }
      } catch (err) {
        if (isMounted) {
          setDatasets([])
          setError(err.message || 'Could not fetch datasets')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDatasets()

    return () => {
      isMounted = false
    }
  }, [filters])

  const totalText = useMemo(() => {
    const count = datasets.length
    return `${count} dataset${count === 1 ? '' : 's'} found`
  }, [datasets])

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <section>
      <DatasetFilters
        filters={filters}
        sectors={sectors}
        onChange={handleFilterChange}
        onClear={() => setFilters(INITIAL_FILTERS)}
      />

      <div className="row">
        <h2 className="results-count">{totalText}</h2>
      </div>

      {loading && <p className="msg">Loading datasets...</p>}
      {!loading && error && <p className="msg error">{error}</p>}
      {!loading && !error && datasets.length === 0 && (
        <p className="msg">No datasets found for this sector.</p>
      )}

      {!loading && !error && datasets.length > 0 && (
        <div className="grid">
          {datasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              onOpen={() => navigate(`/datasets/${dataset.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
