# SDA Metadata Registry Platform

## Background

The State Data Authority (SDA) of Uttar Pradesh is building a Metadata Registry Platform to help departments register, discover, and govern data assets in line with Vision 2030 and the DPDP Act.

This prototype includes two core interfaces:

- Public dataset discovery portal
- Department dataset registration form

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express
- Data store: In-memory JSON from `data/seed_datasets.json`

## Implemented Scope

- Discovery view (`/`) with search, sector filter, classification filter, and result count
- Dataset cards showing title, department, sector, format badges, last updated, classification badge, and status
- Dataset detail view (`/datasets/:id`) showing full metadata
- Registration form (`/datasets/new`) with required-field validation
- Backend REST API with required endpoints and CORS enabled
- New dataset ID generation using existing code patterns (`UP-{CODE}-{###}`)

## Run Locally (Fresh Clone)

Prerequisites: Node.js 18+ and npm.

1. Clone the repository and enter the project.

```bash
git clone <your-repo-url>
cd assignment/sda-metadata-portal
```

1. Start backend.

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:5000`.

1. Start frontend in a new terminal.

```bash
cd sda-metadata-portal/frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### Environment Variables

Backend (`backend/.env`):

```env
PORT=5000
```

Frontend (`frontend/.env`):

```env
VITE_API_BASE=http://localhost:5000
```

## API Endpoint Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/datasets` | List datasets with filters |
| GET | `/datasets/:id` | Get one dataset by ID |
| POST | `/datasets` | Register a new dataset |
| GET | `/sectors` | Get distinct sectors |
| GET | `/departments` | Get distinct departments |

### GET `/datasets`

Supported query params:

- `sector`
- `classification`
- `status`
- `search` (matches title and description)

Example:

```http
GET /api/datasets?sector=Education&classification=Public&search=attendance
```

### GET `/datasets/:id`

Example:

```http
GET /api/datasets/UP-REV-001
```

Sample success response:

```json
{
  "id": "UP-REV-001",
  "title": "Land Records – Bhulekh UP",
  "department": "Revenue Department",
  "sector": "Land & Revenue",
  "formats": ["CSV", "JSON"],
  "update_frequency": "Monthly",
  "last_updated": "2024-11-01",
  "record_count": 158000000,
  "coverage": "State",
  "description": "District-wise land ownership and mutation records for all 75 districts of Uttar Pradesh.",
  "tags": ["land", "revenue", "bhulekh", "mutation"],
  "classification": "Public",
  "status": "Registered"
}
```

Not found response:

```json
{ "error": "Dataset not found" }
```

### POST `/datasets`

Required fields:

- `title`
- `department`
- `sector`
- `formats`
- `update_frequency`
- `description`
- `classification`

Sample request:

```json
{
  "title": "District Crop Damage Assessments",
  "department": "Agriculture Department",
  "sector": "Agriculture",
  "formats": ["CSV", "JSON"],
  "update_frequency": "Quarterly",
  "coverage": "District",
  "description": "District-wise crop damage assessments and recovery reports.",
  "classification": "Restricted",
  "tags": ["crop", "damage", "agriculture"]
}
```

Validation error (`422`) example:

```json
{ "error": "Missing required field(s): sector, formats" }
```

## Design Decisions and Trade-offs

- In-memory JSON storage keeps setup simple and fast for this prototype; trade-off is no persistence after backend restart.
- Intelligent code resolution reuses existing department/sector code patterns for better IDs; trade-off is additional backend logic complexity.
- Frontend uses `VITE_API_BASE` so backend URL is configurable; trade-off is dependency on correct `.env` setup.
- UI language and form labels are intentionally simple for non-technical government users.

## What I Would Improve With More Time

- Persistent database (PostgreSQL or MongoDB)
- Authentication and role-based access control
- OpenAPI/Swagger documentation
- Automated backend and frontend tests
- Pagination and sorting for larger dataset catalogs
- Docker and CI/CD setup

## Project Structure

```text
sda-metadata-portal/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       │   ├── DatasetCard.jsx
│       │   ├── DatasetFilters.jsx
│       │   ├── RegistrationForm.jsx
│       │   └── DatasetDetailModal.jsx
│       ├── pages/
│       │   ├── DiscoveryPage.jsx
│       │   ├── DatasetDetailPage.jsx
│       │   └── RegisterPage.jsx
│       └── constants/
│           └── options.js
└── data/
    └── seed_datasets.json
```
