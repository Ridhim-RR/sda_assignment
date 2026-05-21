const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


const datasets = require("../data/seed_datasets.json");

function getCodeFromId(id) {
  if (typeof id !== "string") {
    return null;
  }

  const match = id.match(/^UP-([A-Z]{3})-\d{3}$/);
  return match ? match[1] : null;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function tokenizeKeywords(value) {
  const stopwords = new Set([
    "and",
    "of",
    "the",
    "for",
    "to",
    "in",
    "on",
    "with",
    "by",
    "at",
    "from",
    "a",
    "an",
  ]);

  return String(value || "")
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9]/g, ""))
    .filter((word) => word && !stopwords.has(word));
}

function buildCodeMaps(existingDatasets) {
  const deptToCodes = new Map();
  const sectorToCodes = new Map();
  const recordsBySectorCode = new Map();

  existingDatasets.forEach((dataset) => {
    const code = getCodeFromId(dataset?.id);
    if (!code) {
      return;
    }

    const departmentKey = normalize(dataset?.department);
    const sectorKey = normalize(dataset?.sector);

    if (departmentKey) {
      if (!deptToCodes.has(departmentKey)) {
        deptToCodes.set(departmentKey, new Set());
      }
      deptToCodes.get(departmentKey).add(code);
    }

    if (sectorKey) {
      if (!sectorToCodes.has(sectorKey)) {
        sectorToCodes.set(sectorKey, new Set());
      }
      sectorToCodes.get(sectorKey).add(code);

      const groupKey = `${sectorKey}::${code}`;
      if (!recordsBySectorCode.has(groupKey)) {
        recordsBySectorCode.set(groupKey, []);
      }
      recordsBySectorCode.get(groupKey).push(dataset);
    }
  });

  return { deptToCodes, sectorToCodes, recordsBySectorCode };
}

function deriveFallbackCode(sector) {
  const words = String(sector || "")
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z]/g, ""))
    .filter((word) => word && word !== "and" && word !== "of");

  if (words.length === 0) {
    return "XXX";
  }

  let code = words[0].slice(0, 3);
  if (code.length < 3) {
    code += words.slice(1).map((word) => word.charAt(0)).join("");
  }
  if (code.length < 3) {
    code += words.join("");
  }

  return code.toUpperCase().slice(0, 3).padEnd(3, "X");
}

function resolveDatasetCode(newEntry, existingDatasets) {
  const { deptToCodes, sectorToCodes, recordsBySectorCode } =
    buildCodeMaps(existingDatasets);

  const departmentKey = normalize(newEntry?.department);
  const sectorKey = normalize(newEntry?.sector);

  const departmentCodes = deptToCodes.get(departmentKey);
  if (departmentCodes && departmentCodes.size === 1) {
    return Array.from(departmentCodes)[0];
  }

  const sectorCodes = sectorToCodes.get(sectorKey);
  if (sectorCodes && sectorCodes.size === 1) {
    return Array.from(sectorCodes)[0];
  }

  if (sectorCodes && sectorCodes.size > 1) {
    const entryText = [
      newEntry?.title,
      newEntry?.description,
      Array.isArray(newEntry?.tags) ? newEntry.tags.join(" ") : newEntry?.tags,
      newEntry?.department,
    ].join(" ");
    const entryTokens = new Set(tokenizeKeywords(entryText));

    let bestCode = null;
    let bestScore = -1;

    Array.from(sectorCodes).forEach((code) => {
      const groupKey = `${sectorKey}::${code}`;
      const records = recordsBySectorCode.get(groupKey) || [];

      let score = 0;
      records.forEach((record) => {
        const recordText = [
          record?.title,
          record?.description,
          Array.isArray(record?.tags) ? record.tags.join(" ") : record?.tags,
          record?.department,
        ].join(" ");
        const recordTokens = new Set(tokenizeKeywords(recordText));
        entryTokens.forEach((token) => {
          if (recordTokens.has(token)) {
            score += 1;
          }
        });
      });

      if (score > bestScore) {
        bestScore = score;
        bestCode = code;
      }
    });

    if (bestCode) {
      return bestCode;
    }
  }

  return deriveFallbackCode(newEntry?.sector);
}

function getNextSequence(existingDatasets) {
  const maxSequence = existingDatasets.reduce((max, dataset) => {
    if (!dataset || typeof dataset.id !== "string") {
      return max;
    }

    const match = dataset.id.match(/-(\d{3})$/);
    if (!match) {
      return max;
    }

    const sequence = Number(match[1]);
    if (Number.isNaN(sequence)) {
      return max;
    }

    return Math.max(max, sequence);
  }, 0);

  return String(maxSequence + 1).padStart(3, "0");
}


// list all datasets with filters
app.get("/api/datasets", (req, res) => {
  let results = datasets;
  const { sector, classification, status, search } = req.query;

  if (sector) {
    results = results.filter(
      (d) => d.sector && d.sector.toLowerCase() === sector.toLowerCase(),
    );
  }
  if (classification) {
    results = results.filter(
      (d) =>
        d.classification &&
        d.classification.toLowerCase() === classification.toLowerCase(),
    );
  }
  if (status) {
    results = results.filter(
      (d) => d.status && d.status.toLowerCase() === status.toLowerCase(),
    );
  }
  if (search) {
    const s = search.toLowerCase();
    results = results.filter(
      (d) =>
        d.title?.toLowerCase().includes(s) ||
        d.description?.toLowerCase().includes(s),
    );
  }
  res.json(results);
});

// get dataset by ID
app.get("/api/datasets/:id", (req, res) => {
  const { id } = req.params;
  const found = datasets.find((d) => d.id === id);
  if (!found) {
    return res.status(404).json({ error: "Dataset not found" });
  }
  res.json(found);
});

// register a new dataset
app.post("/api/datasets", (req, res) => {
  const requiredFields = [
    "title",
    "department",
    "sector",
    "formats",
    "update_frequency",
    "description",
    "classification",
  ];
  const missing = requiredFields.filter(
    (f) =>
      !req.body[f] || (Array.isArray(req.body[f]) && req.body[f].length === 0),
  );
  if (missing.length > 0) {
    return res
      .status(422)
      .json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }

  const code = resolveDatasetCode(req.body, datasets);
  const sequence = getNextSequence(datasets);
  const newId = `UP-${code}-${sequence}`;
  const newDataset = {
    id: newId,
    ...req.body,
    status: req.body.status || "Pending Review",
    last_updated: new Date().toISOString().slice(0, 10),
  };
  datasets.push(newDataset);
  res.status(201).json(newDataset);
});

// /api/sectors - list of unique sectors
app.get("/api/sectors", (req, res) => {
  const sectors = Array.from(
    new Set(datasets.map((d) => d.sector).filter(Boolean)),
  );
  res.json(sectors);
});

// /api/departments - list of unique departments
app.get("/api/departments", (req, res) => {
  const departments = Array.from(
    new Set(datasets.map((d) => d.department).filter(Boolean)),
  );
  res.json(departments);
});


// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
