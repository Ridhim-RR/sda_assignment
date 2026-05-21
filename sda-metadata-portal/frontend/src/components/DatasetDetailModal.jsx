import PropTypes from 'prop-types'

export default function DatasetDetailModal({ dataset, onClose }) {
  if (!dataset) {
    return null
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
    <div className="modal-overlay">
      <dialog className="modal" open>
        <div className="modal-head">
          <h3>Dataset Details</h3>
          <button type="button" className="secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="detail-grid">
          {fields.map(([label, value]) => (
            <div key={label} className="detail-row">
              <strong>{label}</strong>
              <span>{value || 'N/A'}</span>
            </div>
          ))}
        </div>
      </dialog>
    </div>
  )
}

DatasetDetailModal.propTypes = {
  dataset: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    department: PropTypes.string,
    sector: PropTypes.string,
    formats: PropTypes.arrayOf(PropTypes.string),
    update_frequency: PropTypes.string,
    last_updated: PropTypes.string,
    record_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    coverage: PropTypes.string,
    description: PropTypes.string,
    tags: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    classification: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
}
