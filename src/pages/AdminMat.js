import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';

const AdminMat = () => {
    const [matriculas, setMatriculas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [asignaturas, setAsignaturas] = useState([]);
    const [currentMatricula, setCurrentMatricula] = useState(null);
    const [idUsuario, setIdUsuario] = useState('');
    const [idAsignatura, setIdAsignatura] = useState('');
    const [curso, setCurso] = useState('');
    const [nota, setNota] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        axios.get('http://localhost:5000/admin/matriculas')
            .then(response => setMatriculas(response.data))
            .catch(error => console.error('Error al obtener las matrículas:', error));
        
        axios.get('http://localhost:5000/admin/usuarios')
            .then(response => setUsuarios(response.data))
            .catch(error => console.error('Error al obtener los usuarios:', error));
        
        axios.get('http://localhost:5000/admin/asignaturas')
            .then(response => setAsignaturas(response.data))
            .catch(error => console.error('Error al obtener las asignaturas:', error));
    }, []);

    const handleDelete = (id) => {
        axios.delete(`http://localhost:5000/admin/matriculas/${id}`)
            .then(() => {
                setMatriculas(matriculas.filter(matricula => matricula.id !== id));
            })
            .catch(error => console.error('Error al eliminar la matrícula:', error));
    };

    const handleEdit = (matricula) => {
        setCurrentMatricula(matricula);
        setIdUsuario(matricula.id_usuario);
        setIdAsignatura(matricula.id_asignatura);
        setCurso(matricula.Curso);
        setNota(matricula.Nota);
    };

    const handleSubmit = () => {
        const matriculaData = { id_usuario: idUsuario, id_asignatura: idAsignatura, Curso: curso, Nota: nota };

        if (currentMatricula) {
            axios.put(`http://localhost:5000/admin/matriculas/${currentMatricula.id}`, matriculaData)
                .then(response => {
                    setMatriculas(matriculas.map(matricula => 
                        matricula.id === currentMatricula.id ? response.data : matricula
                    ));
                    resetForm();
                })
                .catch(error => console.error('Error al actualizar la matrícula:', error));
        } else {
            axios.post('http://localhost:5000/admin/matriculas', matriculaData)
                .then(response => {
                    setMatriculas([...matriculas, response.data]);
                    resetForm();
                })
                .catch(error => console.error('Error al agregar la matrícula:', error));
        }
    };

    const resetForm = () => {
        setCurrentMatricula(null);
        setIdUsuario('');
        setIdAsignatura('');
        setCurso('');
        setNota('');
    };

    const filteredMatriculas = matriculas.filter(matricula => 
        matricula.Curso.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMatriculas = filteredMatriculas.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMatriculas.length / itemsPerPage);

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
        <div className="flex flex-col min-h-screen bg-pink-50">
            <Header />
            <main className="flex-grow flex flex-col items-center p-6" id="content">
                <h2 className="text-xl font-bold mb-4">Gestión de Matrículas</h2>
                
                <div className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        className="border rounded px-2 py-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por curso"
                    />
                    <select className="border rounded px-2 py-1" value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)}>
                        <option value="">Seleccionar Usuario</option>
                        {usuarios.map(usuario => (
                            <option key={usuario.id} value={usuario.id}>{usuario.Nombre}</option>
                        ))}
                    </select>
                    <select className="border rounded px-2 py-1" value={idAsignatura} onChange={(e) => setIdAsignatura(e.target.value)}>
                        <option value="">Seleccionar Asignatura</option>
                        {asignaturas.map(asignatura => (
                            <option key={asignatura.id} value={asignatura.id}>{asignatura.Nombre}</option>
                        ))}
                    </select>
                    <input type="text" className="border rounded px-2 py-1" value={curso} onChange={(e) => setCurso(e.target.value)} placeholder="Curso" />
                    <input type="number" className="border rounded px-2 py-1" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota" step="0.1" />
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleSubmit}>
                        {currentMatricula ? 'Actualizar' : 'Agregar'}
                    </button>
                </div>
                
                <table className="table-auto border-collapse w-3/4 text-sm">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-4 py-2">Usuario</th>
                            <th className="border px-4 py-2">Asignatura</th>
                            <th className="border px-4 py-2">Curso</th>
                            <th className="border px-4 py-2">Nota</th>
                            <th className="border px-4 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentMatriculas.map(matricula => (
                            <tr key={matricula.id} className="text-center">
                                <td className="border px-4 py-2">{matricula.id_usuario}</td>
                                <td className="border px-4 py-2">{matricula.id_asignatura}</td>
                                <td className="border px-4 py-2">{matricula.Curso}</td>
                                <td className="border px-4 py-2">{matricula.Nota}</td>
                                <td className="border px-4 py-2 flex justify-center space-x-2">
                                    <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(matricula)}>Editar</button>
                                    <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(matricula.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 flex justify-between">
                    <button 
                        className="bg-gray-500 text-white px-3 py-1 rounded"
                        onClick={handlePreviousPage} 
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>
                    <button 
                        className="bg-gray-500 text-white px-3 py-1 rounded"
                        onClick={handleNextPage} 
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminMat;