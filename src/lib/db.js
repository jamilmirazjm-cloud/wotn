/**
 * WOTN LocalStorage Database Layer
 * CRUD operations for people, observations, predictions, outcomes
 */

import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  PEOPLE: 'wotn_people',
  OBSERVATIONS: 'wotn_observations',
  PREDICTIONS: 'wotn_predictions',
  OUTCOMES: 'wotn_outcomes',
};

function getCollection(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCollection(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ============================================================================
// PEOPLE
// ============================================================================

export function createPerson({ name, relationshipType, firstImpression }) {
  const people = getCollection(STORAGE_KEYS.PEOPLE);
  const person = {
    id: uuidv4(),
    name,
    relationshipType,
    firstImpression: firstImpression || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  people.push(person);
  saveCollection(STORAGE_KEYS.PEOPLE, people);
  return person;
}

export function getPeople() {
  const people = getCollection(STORAGE_KEYS.PEOPLE);
  const observations = getCollection(STORAGE_KEYS.OBSERVATIONS);
  const predictions = getCollection(STORAGE_KEYS.PREDICTIONS);

  return people.map((p) => {
    const personObs = observations.filter((o) => o.personId === p.id);
    const personPreds = predictions.filter((pr) => pr.personId === p.id);
    const lastObs = personObs.sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt))[0];
    const lastPred = personPreds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    return {
      ...p,
      observationCount: personObs.length,
      predictionCount: personPreds.length,
      lastObservationDate: lastObs?.loggedAt || null,
      lastPredictionDate: lastPred?.createdAt || null,
    };
  });
}

export function getPerson(id) {
  const people = getCollection(STORAGE_KEYS.PEOPLE);
  return people.find((p) => p.id === id) || null;
}

export function deletePerson(id) {
  let people = getCollection(STORAGE_KEYS.PEOPLE);
  people = people.filter((p) => p.id !== id);
  saveCollection(STORAGE_KEYS.PEOPLE, people);

  // Cascade delete
  let observations = getCollection(STORAGE_KEYS.OBSERVATIONS);
  observations = observations.filter((o) => o.personId !== id);
  saveCollection(STORAGE_KEYS.OBSERVATIONS, observations);

  let predictions = getCollection(STORAGE_KEYS.PREDICTIONS);
  predictions = predictions.filter((pr) => pr.personId !== id);
  saveCollection(STORAGE_KEYS.PREDICTIONS, predictions);

  let outcomes = getCollection(STORAGE_KEYS.OUTCOMES);
  outcomes = outcomes.filter((o) => o.personId !== id);
  saveCollection(STORAGE_KEYS.OUTCOMES, outcomes);
}

// ============================================================================
// OBSERVATIONS
// ============================================================================

export function createObservation({ personId, text, tags }) {
  const observations = getCollection(STORAGE_KEYS.OBSERVATIONS);
  const observation = {
    id: uuidv4(),
    personId,
    text,
    tags: tags || [],
    sentiment: null,
    loggedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  observations.push(observation);
  saveCollection(STORAGE_KEYS.OBSERVATIONS, observations);

  // Update person's updatedAt
  const people = getCollection(STORAGE_KEYS.PEOPLE);
  const idx = people.findIndex((p) => p.id === personId);
  if (idx !== -1) {
    people[idx].updatedAt = new Date().toISOString();
    saveCollection(STORAGE_KEYS.PEOPLE, people);
  }

  return observation;
}

export function getObservations(personId) {
  const observations = getCollection(STORAGE_KEYS.OBSERVATIONS);
  return observations
    .filter((o) => o.personId === personId)
    .sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
}

// ============================================================================
// PREDICTIONS
// ============================================================================

export function createPrediction({ personId, goal, groqResponse }) {
  const predictions = getCollection(STORAGE_KEYS.PREDICTIONS);
  const prediction = {
    id: uuidv4(),
    personId,
    goal,
    behavioralTendencies: groqResponse.behavioral_tendencies,
    personalityRead: groqResponse.personality_read,
    actionCards: groqResponse.action_cards,
    dataQuality: groqResponse.data_quality,
    predictionNote: groqResponse.prediction_note || null,
    groqResponse,
    createdAt: new Date().toISOString(),
  };
  predictions.push(prediction);
  saveCollection(STORAGE_KEYS.PREDICTIONS, predictions);
  return prediction;
}

export function getPredictions(personId) {
  const predictions = getCollection(STORAGE_KEYS.PREDICTIONS);
  return predictions
    .filter((pr) => pr.personId === personId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getPrediction(id) {
  const predictions = getCollection(STORAGE_KEYS.PREDICTIONS);
  return predictions.find((p) => p.id === id) || null;
}

// ============================================================================
// OUTCOMES
// ============================================================================

export function createOutcome({ personId, predictionId, goal, whatHappened, predictionAccuracyRating }) {
  const outcomes = getCollection(STORAGE_KEYS.OUTCOMES);
  const outcome = {
    id: uuidv4(),
    personId,
    predictionId,
    goal,
    whatHappened,
    predictionAccuracyRating: predictionAccuracyRating || null,
    createdAt: new Date().toISOString(),
  };
  outcomes.push(outcome);
  saveCollection(STORAGE_KEYS.OUTCOMES, outcomes);
  return outcome;
}

export function getOutcomes(personId) {
  const outcomes = getCollection(STORAGE_KEYS.OUTCOMES);
  return outcomes
    .filter((o) => o.personId === personId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
