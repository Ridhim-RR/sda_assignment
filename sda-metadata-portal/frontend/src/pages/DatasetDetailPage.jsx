import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE

export default function DatasetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dataset, setDataset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDetail() {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`${API_BASE}/api/datasets/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Dataset not found')
        if (isMounted) {
          setDataset(data)
        }
      } catch (err) {
        if (isMounted) {
          setDataset(null)
          setError(err.message || 'Could not load dataset details')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDetail()

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return <p className="msg">Loading dataset details...</p>
  }

  if (error) {
    return (
      <section className="panel">
        <p className="msg error">{error}</p>
        <div className="detail-actions">
          <button type="button" className="secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
          <Link to="/" className="secondary-link">
            Back
          </Link>
        </div>
      </section>
    )
  }

  const fields = [
    ['ID', dataset.id],
    ['Title', dataset.title],
    ['Department', dataset.department],
    ['Sector', dataset.sector],
    ['Formats', (dataset.formats || []).join(', ')],
    ['Update Frequency', dataset.update_frequency],
    ['Last Updated', dataset.last_updated],
    ['Record Count', dataset.record_count],
    ['Coverage', dataset.coverage],
    ['Description', dataset.description],
    ['Tags', Array.isArray(dataset.tags) ? dataset.tags.join(', ') : dataset.tags],
    ['Classification', dataset.classification],
    ['Status', dataset.status],
  ]

  return (
    <section className="panel">
      <div className="row detail-header">
        <h2>Dataset Details</h2>
        <div className="detail-actions">
          <Link to="/" className="secondary-link">
            Back
          </Link>
        </div>
      </div>

      <div className="detail-grid">
        {fields.map(([label, value]) => (
          <div key={label} className="detail-row">
            <strong>{label}</strong>
            <span>{value || 'N/A'}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
