const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

function getHeaders() {
  const token = localStorage.getItem('wotn_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function camelize(obj) {
  if (Array.isArray(obj)) return obj.map(camelize);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      let camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      if (key === 'observationcount') camelKey = 'observationCount';
      if (key === 'lastobservationdate') camelKey = 'lastObservationDate';
      acc[camelKey] = camelize(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

export async function getPeople() {
  const res = await fetch(`${API_URL}/people`, { headers: getHeaders() });
  return camelize(await res.json());
}

export async function createPerson({ name, relationshipType, firstImpression }) {
  const res = await fetch(`${API_URL}/people`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, relationshipType, firstImpression })
  });
  if (!res.ok) throw new Error(await res.text());
  return camelize(await res.json());
}

export async function getPerson(id) {
  const res = await fetch(`${API_URL}/people/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Not found');
  return camelize(await res.json());
}

export async function deletePerson(id) {
  return true;
}

export async function getObservations(personId) {
  const res = await fetch(`${API_URL}/observations/${personId}`, { headers: getHeaders() });
  return camelize(await res.json());
}

export async function createObservation({ personId, text, tags, sentiment }) {
  const res = await fetch(`${API_URL}/observations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ personId, text, tags, sentiment })
  });
  return camelize(await res.json());
}

export async function generatePrediction(personId, goal) {
  const res = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ personId, goal })
  });
  if (!res.ok) throw new Error(await res.text());
  return camelize(await res.json());
}

export async function getPredictions(personId) {
  const person = await getPerson(personId);
  return person.predictions || [];
}

export async function getOutcomes(personId) {
  const res = await fetch(`${API_URL}/outcomes/${personId}`, { headers: getHeaders() });
  return camelize(await res.json());
}

export async function claimLegacyData() {
  const res = await fetch(`${API_URL}/auth/claim-legacy-data`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createOutcome({ personId, predictionId, goal, whatHappened, predictionAccuracyRating }) {
  const res = await fetch(`${API_URL}/outcomes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ personId, predictionId, goal, whatHappened, accuracyRating: predictionAccuracyRating })
  });
  return camelize(await res.json());
}
