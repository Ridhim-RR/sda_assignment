import PropTypes from 'prop-types'

export default function DatasetFilters({
  filters,
  sectors,
  onChange,
  onClear,
}) {
  return (
    <div className="panel filters">
      <div>
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          value={filters.search}
          onChange={(event) => onChange('search', event.target.value)}
          placeholder="Search by title or description"
        />
      </div>

      <div>
        <label htmlFor="sector">Sector</label>
        <select
          id="sector"
          value={filters.sector}
          onChange={(event) => onChange('sector', event.target.value)}
        >
          <option value="">All sectors</option>
          {sectors.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="classification">Classification</label>
        <select
          id="classification"
          value={filters.classification}
          onChange={(event) => onChange('classification', event.target.value)}
        >
          <option value="">All classifications</option>
          <option value="Public">Public</option>
          <option value="Restricted">Restricted</option>
          <option value="Confidential">Confidential</option>
        </select>
      </div>

      <div className="filters-clear">
        <button type="button" className="secondary" onClick={onClear}>
          Clear Filters
        </button>
      </div>
    </div>
  )
}

DatasetFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    sector: PropTypes.string,
    classification: PropTypes.string,
  }).isRequired,
  sectors: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
}
