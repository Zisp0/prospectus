import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Prospects from './pages/Prospects';
import LoadCSV from './pages/LoadCSV';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/prospectos" element={<Prospects />} />
            <Route path="/carga-csv" element={<LoadCSV />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
