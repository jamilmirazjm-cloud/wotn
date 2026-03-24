import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../lib/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const refreshPeople = useCallback(async () => {
    try {
      const data = await api.getPeople();
      setPeople(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load people');
    }
  }, []);

  const addPerson = useCallback(async ({ name, relationshipType, firstImpression }) => {
    try {
      const person = await api.createPerson({ name, relationshipType, firstImpression });
      await refreshPeople();
      showToast(`${name} added`);
      return person;
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to add person');
      throw e;
    }
  }, [refreshPeople, showToast]);

  const removePerson = useCallback(async (id) => {
    try {
      await api.deletePerson(id); // MVP: maybe not implemented backend, but clears UI
      await refreshPeople();
      showToast('Person removed');
    } catch (e) {
      console.error(e);
    }
  }, [refreshPeople, showToast]);

  const addObservation = useCallback(async ({ personId, text, tags }) => {
    try {
      const obs = await api.createObservation({ personId, text, tags });
      await refreshPeople();
      showToast('Observation logged');
      return obs;
    } catch (e) {
      console.error(e);
      setError('Failed to log observation');
      throw e;
    }
  }, [refreshPeople, showToast]);

  const getObservations = useCallback(async (personId) => {
    return await api.getObservations(personId);
  }, []);

  const requestPrediction = useCallback(async (personId, goal, scenario) => {
    setLoading(true);
    setError(null);
    try {
      const prediction = await api.generatePrediction(personId, goal, scenario);
      await refreshPeople();
      return prediction;
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate prediction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshPeople]);

  const getBtpProgress = useCallback(async (personId) => {
    return await api.getBtpProgress(personId);
  }, []);

  const saveBtpAnswer = useCallback(async ({ personId, text, signalCategory, questionId, relationshipContext }) => {
    try {
      const obs = await api.saveBtpAnswer({ personId, text, signalCategory, questionId, relationshipContext });
      await refreshPeople();
      showToast('Answer saved');
      return obs;
    } catch (e) {
      console.error(e);
      setError('Failed to save answer');
      throw e;
    }
  }, [refreshPeople, showToast]);

  const getPredictions = useCallback(async (personId) => {
    return await api.getPredictions(personId);
  }, []);

  const getPrediction = useCallback(async (id) => {
    // To get a single prediction, we'd need a backend endpoint or find it from person
    // For MVP playbook screen, it passes predictionId but currently playbook doesn't really fetch prediction from DB directly,
    // wait, PlaybookScreen uses getPrediction(predictionId). Let's implement a quick fetch all and find, or assume it's passed via state.
    // Actually the MVP backend GET /api/people/:id returns all predictions. We just need personId.
    // Let's change PlaybookScreen to use the passed state instead. For now:
    console.warn("getPrediction not fully supported via API without personId");
    return null;
  }, []);

  const addOutcome = useCallback(async ({ personId, predictionId, goal, whatHappened, predictionAccuracyRating }) => {
    try {
      const outcome = await api.createOutcome({ personId, predictionId, goal, whatHappened, predictionAccuracyRating });
      await refreshPeople();
      showToast('Outcome logged');
      return outcome;
    } catch (e) {
      console.error(e);
      setError('Failed to log outcome');
      throw e;
    }
  }, [refreshPeople, showToast]);

  const getOutcomes = useCallback(async (personId) => {
    return await api.getOutcomes(personId);
  }, []);

  useEffect(() => {
    refreshPeople();
  }, [refreshPeople]);

  const value = {
    people,
    loading,
    error,
    toast,
    clearError,
    refreshPeople,
    addPerson,
    removePerson,
    addObservation,
    getObservations,
    requestPrediction,
    getPredictions,
    getPrediction,
    addOutcome,
    getOutcomes,
    getBtpProgress,
    saveBtpAnswer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
