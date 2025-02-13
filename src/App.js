import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProfessorDash from './pages/ProfessorDash';
import StudentDash from './pages/StudentDash';
import ProtectedRoute from './components/ProtectedRoute';
import ProfessorVisualization from './pages/ProfessorVisualization';
import StudentVisualization from './pages/StudentVisualization';
import ErrorPage from './pages/ErrorPage';

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Ruta pública */}
                <Route path="/" element={<LoginPage />} />

                {/* Rutas protegidas */}
                <Route 
                    path="/ProfessorDash" 
                    element={
                        <ProtectedRoute allowedRoles="teacher">
                            <ProfessorDash />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/StudentDash" 
                    element={
                        <ProtectedRoute allowedRoles="student">
                            <StudentDash />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/ProfessorVisualization" 
                    element={
                        <ProtectedRoute allowedRoles="teacher">
                            <ProfessorVisualization />
                        </ProtectedRoute>
                    }
                    
                />  
                <Route 
                    path="/StudentVisualization" 
                    element={
                        <ProtectedRoute allowedRoles="student">
                            <StudentVisualization />
                        </ProtectedRoute>
                    }
                />  
                <Route path="/Error" element={<ErrorPage />} />
            </Routes>
        </Router>
    );
};

export default App;
