import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header, Footer } from "../components/HeaderFooter.js";
import '../styles/Common.css';

const AdminEvent = () => {
    const [eventos, setEventos] = useState([]);
    const [matriculas, setMatriculas] = useState([]);
    const [currentEvento, setCurrentEvento] = useState(null);
    const [idMatricula, setIdMatricula] = useState('');
    const [hora, setHora] = useState('');
    const [nombre, setNombre] = useState('');
    const [afectado, setAfectado] = useState('');
    const [contexto, setContexto] = useState('');
    const [componente, setComponente] = useState('');
    const [evento, setEvento] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [origen, setOrigen] = useState('');
    const [ip, setIp] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        axios.get('http://localhost:5000/admin/eventos')
            .then(response => setEventos(response.data))
            .catch(error => console.error('Error al obtener los eventos:', error));

        axios.get('http://localhost:5000/admin/matriculas')
            .then(response => setMatriculas(response.data))
            .catch(error => console.error('Error al obtener las matrículas:', error));
    }, []);

    const handleDelete = (id) => {
        axios.delete(`http://localhost:5000/admin/eventos/${id}`)
            .then(() => {
                setEventos(eventos.filter(evento => evento.id !== id));
            })
            .catch(error => console.error('Error al eliminar el evento:', error));
    };

    const handleEdit = (evento) => {
        setCurrentEvento(evento);
        setIdMatricula(evento.id_matricula);
        setHora(evento.Hora);
        setNombre(evento.Nombre);
        setAfectado(evento.Afectado);
        setContexto(evento.Contexto);
        setComponente(evento.Componente);
        setEvento(evento.Evento);
        setDescripcion(evento.Descripcion);
        setOrigen(evento.Origen);
        setIp(evento.Ip);
    };

    const handleSubmit = () => {
        const eventoData = { id_matricula: idMatricula, Hora: hora, Nombre: nombre, Afectado: afectado, Contexto: contexto, Componente: componente, Evento: evento, Descripcion: descripcion, Origen: origen, Ip: ip };

        if (currentEvento) {
            axios.put(`http://localhost:5000/admin/eventos/${currentEvento.id}`, eventoData)
                .then(response => {
                    setEventos(eventos.map(evento => evento.id === currentEvento.id ? response.data : evento));
                    resetForm();
                })
                .catch(error => console.error('Error al actualizar el evento:', error));
        } else {
            axios.post('http://localhost:5000/admin/eventos', eventoData)
                .then(response => {
                    setEventos([...eventos, response.data]);
                    resetForm();
                })
                .catch(error => console.error('Error al agregar el evento:', error));
        }
    };

    const resetForm = () => {
        setCurrentEvento(null);
        setIdMatricula('');
        setHora('');
        setNombre('');
        setAfectado('');
        setContexto('');
        setComponente('');
        setEvento('');
        setDescripcion('');
        setOrigen('');
        setIp('');
    };

    const filteredEventos = eventos.filter(evento => evento.Nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEventos = filteredEventos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEventos.length / itemsPerPage);

    return (
        <div className="flex flex-col min-h-screen bg-blue-50">
            <Header />
            <main className="flex-grow flex flex-col items-center p-6" id="content">
                <h2 className="text-xl font-bold mb-4">Gestión de Eventos</h2>
                <input type="text" placeholder="Buscar evento" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button onClick={handleSubmit}>{currentEvento ? "Actualizar" : "Agregar"}</button>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Hora</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentEventos.map(evento => (
                            <tr key={evento.id}>
                                <td>{evento.Nombre}</td>
                                <td>{evento.Hora}</td>
                                <td>
                                    <button onClick={() => handleEdit(evento)}>Editar</button>
                                    <button onClick={() => handleDelete(evento.id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</button>
            </main>
            <Footer />
        </div>
    );
};

export default AdminEvent;