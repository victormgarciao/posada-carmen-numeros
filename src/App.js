import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { initialFinancialRecords, FinancialRecordManager } from './data';
import './styles.css';

// Utility function to get day of the week
function getDayOfWeek(dateString) {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

function App() {
  // Use a state variable for the record manager to trigger re-renders
  const [recordManager] = useState(() => {
    const manager = new FinancialRecordManager();
    return manager;
  });

  // State to manage records with sorting
  const [records, setRecords] = useState(() => 
    initialFinancialRecords.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const updateRecordsList = () => {
    // Sort records by date when updating
    const sortedRecords = recordManager.getAllRecords().sort((a, b) => 
      new Date(a.fecha) - new Date(b.fecha)
    );
    setRecords(sortedRecords);
  };

  const handleAddRecord = (record) => {
    // Add day of week dynamically
    record.dia = getDayOfWeek(record.fecha);
    recordManager.addRecord(record);
    updateRecordsList();
    setIsModalOpen(false);
  };

  const handleUpdateRecord = (id, updatedRecord) => {
    // Update day of week when modifying
    updatedRecord.dia = getDayOfWeek(updatedRecord.fecha);
    recordManager.updateRecord(id, updatedRecord);
    updateRecordsList();
    setIsModalOpen(false);
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      recordManager.deleteRecord(id);
      updateRecordsList();
    }
  };

  const openEditModal = (record) => {
    setCurrentRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className="container">
      <header>
        <h1>Registro Financiero</h1>
        <button onClick={() => {
          setCurrentRecord(null);
          setIsModalOpen(true);
        }}>+ Añadir Registro</button>
      </header>

      <main>
        <div className="financial-table-container">
          <table className="financial-table">
            <thead>
              <tr>
                <th>Día</th>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Cantidad</th>
                <th>Método</th>
                <th>Tipo</th>
                <th>Periodo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  <td>{record.dia}</td>
                  <td>{record.fecha}</td>
                  <td>{record.concepto}</td>
                  <td>€{record.cantidad.toFixed(2)}</td>
                  <td>{record.metodo}</td>
                  <td>{record.tipo}</td>
                  <td>{record.periodo}</td>
                  <td className="actions-cell">
                    <button 
                      className="icon-button edit-button" 
                      onClick={() => openEditModal(record)}
                      title="Editar"
                    >
                      <EditIcon />
                    </button>
                    <button 
                      className="icon-button delete-button" 
                      onClick={() => handleDeleteRecord(record.id)}
                      title="Eliminar"
                    >
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal" style={{display: 'block'}}>
          <div className="modal-content">
            <span className="close-modal" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2>{currentRecord ? 'Editar Registro' : 'Añadir Registro'}</h2>
            <RecordForm 
              record={currentRecord} 
              recordManager={recordManager}
              onSubmit={currentRecord ? 
                (record) => handleUpdateRecord(currentRecord.id, record) : 
                handleAddRecord
              } 
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RecordForm({ record, recordManager, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(record || {
    fecha: new Date().toISOString().split('T')[0],
    concepto: '',
    cantidad: 0,
    metodo: 'Efectivo',
    tipo: 'Pago',
    periodo: 'Orgánico'
  });

  const [isCreatingNewConcepto, setIsCreatingNewConcepto] = useState(false);
  const [newConcepto, setNewConcepto] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'cantidad' ? parseFloat(value) : value
    }));
  };

  const handleConceptoChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      setIsCreatingNewConcepto(true);
    } else {
      setFormData(prev => ({ ...prev, concepto: value }));
      setIsCreatingNewConcepto(false);
    }
  };

  const handleNewConceptoSubmit = () => {
    if (newConcepto.trim()) {
      recordManager.addConcepto(newConcepto);
      setFormData(prev => ({ ...prev, concepto: newConcepto }));
      setIsCreatingNewConcepto(false);
      setNewConcepto('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const conceptos = recordManager.getAllConcepts();

  return (
    <form id="record-form" onSubmit={handleSubmit}>
      <label htmlFor="fecha">Fecha</label>
      <input 
        type="date" 
        id="fecha" 
        value={formData.fecha} 
        onChange={handleChange} 
        required 
      />

      <label htmlFor="concepto">Concepto</label>
      {!isCreatingNewConcepto ? (
        <div className="concepto-select-container">
          <select 
            id="concepto" 
            value={formData.concepto} 
            onChange={handleConceptoChange} 
            required
          >
            <option value="">Seleccionar Concepto</option>
            {conceptos.map(concepto => (
              <option key={concepto} value={concepto}>{concepto}</option>
            ))}
            <option value="__new__">+ Crear Nuevo Concepto</option>
          </select>
        </div>
      ) : (
        <div className="new-concepto-container">
          <input 
            type="text" 
            value={newConcepto} 
            onChange={(e) => setNewConcepto(e.target.value)}
            placeholder="Nuevo Concepto"
            required
          />
          <button type="button" onClick={handleNewConceptoSubmit}>
            Añadir Concepto
          </button>
          <button type="button" onClick={() => setIsCreatingNewConcepto(false)}>
            Cancelar
          </button>
        </div>
      )}

      <label htmlFor="cantidad">Cantidad</label>
      <input 
        type="number" 
        id="cantidad" 
        value={formData.cantidad} 
        onChange={handleChange} 
        step="0.01" 
        required 
      />

      <label htmlFor="metodo">Método</label>
      <select id="metodo" value={formData.metodo} onChange={handleChange} required>
        <option value="Efectivo">Efectivo</option>
        <option value="No efectivo">No efectivo</option>
      </select>

      <label htmlFor="tipo">Tipo</label>
      <select id="tipo" value={formData.tipo} onChange={handleChange} required>
        <option value="Pago">Pago</option>
        <option value="Ingreso">Ingreso</option>
      </select>

      <label htmlFor="periodo">Periodo</label>
      <select id="periodo" value={formData.periodo} onChange={handleChange} required>
        <option value="Orgánico">Orgánico</option>
        <option value="Mensual">Mensual</option>
        <option value="Excepcional">Excepcional</option>
      </select>

      <div className="form-actions">
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

export default App;