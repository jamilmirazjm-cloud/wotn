import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import ProfileView from './pages/ProfileView';
import AddObservation from './pages/AddObservation';
import PredictScreen from './pages/PredictScreen';
import PlaybookScreen from './pages/PlaybookScreen';
import IntelligenceView from './pages/IntelligenceView';
import BuildThePicture from './pages/BuildThePicture';
import AddPersonDialog from './components/AddPersonDialog';
import './index.css';

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`}>
      {toast.message}
    </div>
  );
}

function AppRoutes() {
  const [showAddPerson, setShowAddPerson] = useState(false);
  const navigate = useNavigate();

  const handlePersonCreated = (person) => {
    navigate(`/person/${person.id}`);
  };

  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={<Home onOpenAddPerson={() => setShowAddPerson(true)} />}
        />
        <Route path="/person/:id" element={<ProfileView />} />
        <Route path="/person/:id/observe" element={<AddObservation />} />
        <Route path="/person/:id/predict" element={<PredictScreen />} />
        <Route path="/person/:id/playbook/:predictionId" element={<PlaybookScreen />} />
        <Route path="/person/:id/intelligence" element={<IntelligenceView />} />
        <Route path="/person/:id/build-picture" element={<BuildThePicture />} />
      </Routes>

      <AddPersonDialog
        isOpen={showAddPerson}
        onClose={() => setShowAddPerson(false)}
        onCreated={handlePersonCreated}
      />

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* All protected routes — AppProvider only mounts when authenticated */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppProvider>
                  <AppRoutes />
                </AppProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
