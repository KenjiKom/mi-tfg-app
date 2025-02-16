import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProfessorDash from './pages/ProfessorDash';
import StudentDash from './pages/StudentDash';
import ProtectedRoute from './components/ProtectedRoute';
import ProfessorVisualization from './pages/ProfessorVisualization';
import StudentVisualization from './pages/StudentVisualization';
import ErrorPage from './pages/ErrorPage';
import MainPage from './pages/MainPage';
import AboutUs from './pages/AboutUs';
import FAQ from './pages/FAQ';
import ImportDataPage from './pages/ImportDataPage';

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Ruta pública */}
                <Route path="/" element={<MainPage />} />

                <Route path="/login" element={<LoginPage />} />

                <Route path="/about-us" element={<AboutUs />} />

                <Route path="/faq" element={<FAQ />} />

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

                <Route 
                    path="/import-data" 
                    element={
                        <ProtectedRoute allowedRoles="teacher">
                            <ImportDataPage />
                        </ProtectedRoute>
                    }
                />   
                
                <Route path="/Error" element={<ErrorPage />} />
            </Routes>
        </Router>
    );
};

export default App;
