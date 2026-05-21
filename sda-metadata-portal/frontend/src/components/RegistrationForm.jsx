import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CLASSIFICATION_OPTIONS,
  COVERAGE_OPTIONS,
  FORMAT_OPTIONS,
  FREQUENCY_OPTIONS,
} from '../constants/options'

const API_BASE = import.meta.env.VITE_API_BASE

const INITIAL_FORM = {
  title: '',
  department: '',
  sector: '',
  formats: [],
  update_frequency: '',
  coverage: '',
  description: '',
  classification: '',
  tags: '',
}

export default function RegistrationForm({ onRegistered = () => {} }) {
  const [sectors, setSectors] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [popup, setPopup] = useState(null)

  useEffect(() => {
    async function loadSectors() {
      try {
        const res = await fetch(`${API_BASE}/api/sectors`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load sectors')
        setSectors(data)
      } catch {
        setSectors([])
      }
    }

    loadSectors()
  }, [])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleFormat(value) {
    setForm((prev) => {
      const exists = prev.formats.includes(value)
      const nextFormats = exists
        ? prev.formats.filter((item) => item !== value)
        : [...prev.formats, value]
      return { ...prev, formats: nextFormats }
    })
  }

  function validate() {
    const required = [
      ['title', 'Title'],
      ['department', 'Department'],
      ['sector', 'Sector'],
      ['update_frequency', 'Update Frequency'],
      ['coverage', 'Coverage Level'],
      ['description', 'Description'],
      ['classification', 'Classification'],
    ]

    for (const [key, label] of required) {
      if (!String(form[key] || '').trim()) {
        return `${label} is required.`
      }
    }

    if (form.formats.length === 0) {
      return 'Please choose at least one data format.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setPopup(null)
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    const payload = {
      ...form,
      tags: form.tags
        ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      status: 'Pending Review',
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/datasets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not register dataset')

      setPopup({
        text: `Dataset registered successfully. New ID: ${data.id}`,
      })
      if (typeof onRegistered === 'function') {
        onRegistered()
      }
    } catch (err) {
      setError(err.message || 'Could not register dataset')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      {popup && (
        <div className="toast-wrap" role="status" aria-live="polite">
          <div className="toast success" role="alert">
            <div className="toast-head">
              <h3>Registration Successful</h3>
            </div>
            <p>{popup.text}</p>
            <div className="toast-actions">
              <button
                type="button"
                className="toast-primary"
                onClick={() => {
                  setForm(INITIAL_FORM)
                  setPopup(null)
                }}
              >
                Start Another Submission
              </button>
              <button type="button" className="secondary" onClick={() => setPopup(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <form className="panel form" onSubmit={handleSubmit}>
        <h2>Register a New Dataset</h2>

        {error && <p className="msg error">{error}</p>}

        <label htmlFor="title">Title</label>
        <input id="title" value={form.title} onChange={(e) => updateField('title', e.target.value)} />

        <label htmlFor="department">Department</label>
        <input id="department" value={form.department} onChange={(e) => updateField('department', e.target.value)} />

        <label htmlFor="sector">Sector</label>
        <select id="sector" value={form.sector} onChange={(e) => updateField('sector', e.target.value)}>
          <option value="">Select sector</option>
          {sectors.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>

        <fieldset className="format-group">
          <legend>Data Formats</legend>
          <div className="check-grid">
            {FORMAT_OPTIONS.map((item) => (
              <label key={item} className="check-item">
                <input
                  type="checkbox"
                  checked={form.formats.includes(item)}
                  onChange={() => toggleFormat(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </fieldset>

        <label htmlFor="update_frequency">Update Frequency</label>
        <select
          id="update_frequency"
          value={form.update_frequency}
          onChange={(e) => updateField('update_frequency', e.target.value)}
        >
          <option value="">Select update frequency</option>
          {FREQUENCY_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label htmlFor="coverage">Coverage Level</label>
        <select id="coverage" value={form.coverage} onChange={(e) => updateField('coverage', e.target.value)}>
          <option value="">Select coverage level</option>
          {COVERAGE_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
        />

        <label htmlFor="classification">Classification</label>
        <select
          id="classification"
          value={form.classification}
          onChange={(e) => updateField('classification', e.target.value)}
        >
          <option value="">Select classification</option>
          {CLASSIFICATION_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label htmlFor="tags">Tags (comma-separated)</label>
        <input id="tags" value={form.tags} onChange={(e) => updateField('tags', e.target.value)} />

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </button>
          <button type="button" className="secondary" onClick={() => setForm(INITIAL_FORM)}>
            Reset Form
          </button>
        </div>
      </form>
    </section>
  )
}

RegistrationForm.propTypes = {
  onRegistered: PropTypes.func,
}
