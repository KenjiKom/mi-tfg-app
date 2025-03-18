import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';

const AdminPred = () => {
    const [predicciones, setPredicciones] = useState([]);
    const [matriculas, setMatriculas] = useState([]);
    const [currentPrediccion, setCurrentPrediccion] = useState(null);
    const [idMatricula, setIdMatricula] = useState('');
    const [notaPredicha, setNotaPredicha] = useState('');
    const [cluster, setCluster] = useState('');
    const [clusterNumero, setClusterNumero] = useState('');
    const [fecha, setFecha] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    useEffect(() => {
        axios.get('http://localhost:5000/admin/predicciones')
            .then(response => setPredicciones(response.data))
            .catch(error => console.error('Error al obtener las predicciones:', error));
        
        axios.get('http://localhost:5000/admin/matriculas')
            .then(response => setMatriculas(response.data))
            .catch(error => console.error('Error al obtener las matrículas:', error));
    }, []);
    
    const handleDelete = (id) => {
        axios.delete(`http://localhost:5000/admin/predicciones/${id}`)
            .then(() => {
                setPredicciones(predicciones.filter(prediccion => prediccion.id !== id));
            })
            .catch(error => console.error('Error al eliminar la predicción:', error));
    };
    
    const handleEdit = (prediccion) => {
        setCurrentPrediccion(prediccion);
        setIdMatricula(prediccion.id_matricula);
        setNotaPredicha(prediccion.Nota_predicha);
        setCluster(prediccion.Cluster);
        setClusterNumero(prediccion.Cluster_numero);
        setFecha(prediccion.Fecha);
    };
    
    const handleSubmit = () => {
        const prediccionData = { id_matricula: idMatricula, Nota_predicha: notaPredicha, Cluster: cluster, Cluster_numero: clusterNumero, Fecha: fecha };
    
        if (currentPrediccion) {
            axios.put(`http://localhost:5000/admin/predicciones/${currentPrediccion.id}`, prediccionData)
                .then(response => {
                    setPredicciones(predicciones.map(prediccion => 
                        prediccion.id === currentPrediccion.id ? response.data : prediccion
                    ));
                    resetForm();
                })
                .catch(error => console.error('Error al actualizar la predicción:', error));
        } else {
            axios.post('http://localhost:5000/admin/predicciones', prediccionData)
                .then(response => {
                    setPredicciones([...predicciones, response.data]);
                    resetForm();
                })
                .catch(error => console.error('Error al agregar la predicción:', error));
        }
    };
    
    const resetForm = () => {
        setCurrentPrediccion(null);
        setIdMatricula('');
        setNotaPredicha('');
        setCluster('');
        setClusterNumero('');
        setFecha('');
    };
    
    const filteredPredicciones = predicciones.filter(prediccion => 
        prediccion.Cluster.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPredicciones = filteredPredicciones.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPredicciones.length / itemsPerPage);
    
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    return (
        <div className="flex flex-col min-h-screen bg-blue-50">
            <Header />
            <main className="flex-grow flex flex-col items-center p-6" id="content">
                <h2 className="text-xl font-bold mb-4">Gestión de Predicciones</h2>
                
                <div className="flex space-x-2 mb-4">
                    <input type="text" className="border rounded px-2 py-1" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por cluster" />
                    <select className="border rounded px-2 py-1" value={idMatricula} onChange={(e) => setIdMatricula(e.target.value)}>
                        <option value="">Seleccionar Matrícula</option>
                        {matriculas.map(matricula => (
                            <option key={matricula.id} value={matricula.id}>{matricula.Curso}</option>
                        ))}
                    </select>
                    <input type="number" className="border rounded px-2 py-1" value={notaPredicha} onChange={(e) => setNotaPredicha(e.target.value)} placeholder="Nota Predicha" step="0.1" />
                    <input type="text" className="border rounded px-2 py-1" value={cluster} onChange={(e) => setCluster(e.target.value)} placeholder="Cluster" />
                    <input type="number" className="border rounded px-2 py-1" value={clusterNumero} onChange={(e) => setClusterNumero(e.target.value)} placeholder="Número de Cluster" />
                    <input type="date" className="border rounded px-2 py-1" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleSubmit}>{currentPrediccion ? 'Actualizar' : 'Agregar'}</button>
                </div>
                
                <table className="table-auto border-collapse w-3/4 text-sm">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-4 py-2">Matrícula</th>
                            <th className="border px-4 py-2">Nota Predicha</th>
                            <th className="border px-4 py-2">Cluster</th>
                            <th className="border px-4 py-2">Número</th>
                            <th className="border px-4 py-2">Fecha</th>
                            <th className="border px-4 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPredicciones.map(prediccion => (
                            <tr key={prediccion.id} className="text-center">
                                <td className="border px-4 py-2">{prediccion.id_matricula}</td>
                                <td className="border px-4 py-2">{prediccion.Nota_predicha}</td>
                                <td className="border px-4 py-2">{prediccion.Cluster}</td>
                                <td className="border px-4 py-2">{prediccion.Cluster_numero}</td>
                                <td className="border px-4 py-2">{prediccion.Fecha}</td>
                                <td className="border px-4 py-2 flex justify-center space-x-2">
                                    <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(prediccion)}>Editar</button>
                                    <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(prediccion.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-center space-x-4 mt-4">
                    <button className="bg-gray-300 px-3 py-1 rounded" onClick={handlePreviousPage} disabled={currentPage === 1}>Anterior</button>
                    <button className="bg-gray-300 px-3 py-1 rounded" onClick={handleNextPage} disabled={currentPage === totalPages}>Siguiente</button>
                </div>
            </main>
            <Footer />
        </div>
    );
};    

export default AdminPred;