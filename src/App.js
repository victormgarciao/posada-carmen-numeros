import React, { useState } from 'react';
import { initialFinancialRecords, FinancialRecordManager } from './data';
import './styles.css';

function App() {
  const [records, setRecords] = useState(initialFinancialRecords);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const recordManager = new FinancialRecordManager();

  const handleAddRecord = (record) => {
    const newRecord = recordManager.addRecord(record);
    setRecords([...recordManager.getAllRecords()]);
    setIsModalOpen(false);
  };

  const handleUpdateRecord = (id, updatedRecord) => {
    recordManager.updateRecord(id, updatedRecord);
    setRecords([...recordManager.getAllRecords()]);
    setIsModalOpen(false);
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      recordManager.deleteRecord(id);
      setRecords([...recordManager.getAllRecords()]);
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
        <div className="records-grid">
          {records.map(record => (
            <div key={record.id} className="record-card">
              <p><strong>Día:</strong> {record.dia}</p>
              <p><strong>Fecha:</strong> {record.fecha}</p>
              <p><strong>Concepto:</strong> {record.concepto}</p>
              <p><strong>Cantidad:</strong> €{record.cantidad.toFixed(2)}</p>
              <p><strong>Método:</strong> {record.metodo}</p>
              <p><strong>Tipo:</strong> {record.tipo}</p>
              <p><strong>Periodo:</strong> {record.periodo}</p>
              <div className="record-actions">
                <button onClick={() => openEditModal(record)}>Editar</button>
                <button onClick={() => handleDeleteRecord(record.id)}>Eliminar</button>
              </div>
            </div>
          ))}
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
    dia: 'Lunes',
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
      <label htmlFor="dia">Día</label>
      <select id="dia" value={formData.dia} onChange={handleChange} required>
        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => (
          <option key={dia} value={dia}>{dia}</option>
        ))}
      </select>

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

      {/* Rest of the form remains the same */}
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