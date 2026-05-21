import PropTypes from 'prop-types'

export default function DatasetCard({ dataset, onOpen }) {
  return (
    <button type="button" className="card" onClick={onOpen}>
      <div className="card-top">
        <h3>{dataset.title}</h3>
        <span className={`badge ${dataset.classification?.toLowerCase() || 'default'}`}>
          {dataset.classification || 'Unknown'}
        </span>
      </div>

      <p className="muted">{dataset.department}</p>
      <p className="muted">Sector: {dataset.sector || 'N/A'}</p>

      <div className="formats">
        {(dataset.formats || []).map((format) => (
          <span key={`${dataset.id}-${format}`} className="format">
            {format}
          </span>
        ))}
      </div>

      <div className="card-bottom">
        <span>Last Updated: {dataset.last_updated || 'N/A'}</span>
        <span className="status">{dataset.status || 'Unknown'}</span>
      </div>
    </button>
  )
}

DatasetCard.propTypes = {
  dataset: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    classification: PropTypes.string,
    department: PropTypes.string,
    sector: PropTypes.string,
    formats: PropTypes.arrayOf(PropTypes.string),
    last_updated: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onOpen: PropTypes.func.isRequired,
}
