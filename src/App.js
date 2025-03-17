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
import Administration from './pages/Administration';
import AdminUser from './pages/AdminUser';
import AdminAsig from './pages/AdminAsig';
import AdminCourse from './pages/AdminCourse';
import AdminMat from './pages/AdminMat';
import AdminEvent from './pages/AdminEvent';
import AdminPred from './pages/AdminPred';

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
                    path="/Administration" 
                    element={
                        <ProtectedRoute allowedRoles="admin">
                            <Administration />
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path="/AdminUser" 
                    element={
                        <ProtectedRoute allowedRoles="admin">
                            <AdminUser />
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path="/AdminAsig" 
                    element={
                        <ProtectedRoute allowedRoles="admin">
                            <AdminAsig />
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path="/AdminCourse" 
                    element={
                        <ProtectedRoute allowedRoles="admin">
                            <AdminCourse />
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path="/AdminMat" 
                    element={
                        <ProtectedRoute allowedRoles="admin">
                            <AdminMat />
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path="/AdminEvent" 
                    element={
                        <ProtectedRoute allowedRoles="admin">
                            <AdminEvent />
                        </ProtectedRoute>
                    }
                />

                <Route 
                    path="/AdminPred" 
                    element={
                        <ProtectedRoute allowedRoles="admin">
                            <AdminPred />
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
