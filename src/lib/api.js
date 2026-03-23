const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

const HEADERS = {
  'Content-Type': 'application/json',
  // Pseudo-auth for MVP sync via headers
  'X-User-Id': 'imiraz_mvp' 
};

function camelize(obj) {
  if (Array.isArray(obj)) return obj.map(camelize);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      // Postgres COUNT() returns "observationcount" entirely lowercase if not quoted,
      // so let's manually map the known ones or just rely on the server returning correct aliases.
      // Wait, let's just do a generic replace and handle the specific DB aliases.
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
  const res = await fetch(`${API_URL}/people`, { headers: HEADERS });
  return camelize(await res.json());
}

export async function createPerson({ name, relationshipType, firstImpression }) {
  const res = await fetch(`${API_URL}/people`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ name, relationshipType, firstImpression })
  });
  if (!res.ok) throw new Error(await res.text());
  return camelize(await res.json());
}

export async function getPerson(id) {
  const res = await fetch(`${API_URL}/people/${id}`, { headers: HEADERS });
  if (!res.ok) throw new Error('Not found');
  return camelize(await res.json());
}

export async function deletePerson(id) {
  return true;
}

export async function getObservations(personId) {
  const res = await fetch(`${API_URL}/observations/${personId}`, { headers: HEADERS });
  return camelize(await res.json());
}

export async function createObservation({ personId, text, tags, sentiment }) {
  const res = await fetch(`${API_URL}/observations`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ personId, text, tags, sentiment })
  });
  return camelize(await res.json());
}

export async function generatePrediction(personId, goal) {
  const res = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: HEADERS,
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
  const res = await fetch(`${API_URL}/outcomes/${personId}`, { headers: HEADERS });
  return camelize(await res.json());
}

export async function createOutcome({ personId, predictionId, goal, whatHappened, predictionAccuracyRating }) {
  const res = await fetch(`${API_URL}/outcomes`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ personId, predictionId, goal, whatHappened, accuracyRating: predictionAccuracyRating })
  });
  return camelize(await res.json());
}
