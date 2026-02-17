import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SymptomAnalysis from './pages/SymptomAnalysis';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Doctors from './pages/Doctors';
import Layout from './components/Layout';
import './App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('user_id');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<Layout />}>
          <Route
            path="/"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/analyze"
            element={isAuthenticated ? <SymptomAnalysis /> : <Navigate to="/login" />}
          />
          <Route
            path="/chat"
            element={isAuthenticated ? <Chat /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/doctors"
            element={isAuthenticated ? <Doctors /> : <Navigate to="/login" />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
