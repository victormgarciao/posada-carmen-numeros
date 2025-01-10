export const initialFinancialRecords = [
  {
    id: 1,
    dia: 'Lunes',
    fecha: '2025-01-06',
    concepto: 'Compra de supermercado',
    cantidad: 75.50,
    metodo: 'Efectivo',
    tipo: 'Pago',
    periodo: 'Orgánico'
  },
  {
    id: 2,
    dia: 'Martes', 
    fecha: '2025-01-07',
    concepto: 'Ingreso freelance',
    cantidad: 500.00,
    metodo: 'No efectivo',
    tipo: 'Ingreso',
    periodo: 'Mensual'
  }
];

export class FinancialRecordManager {
    constructor() {
      this.records = [...initialFinancialRecords];
      this.conceptos = this.extractUniqueConcepts();
      this.nextId = Math.max(...this.records.map(r => r.id), 0) + 1;
    }

  extractUniqueConcepts() {
    return [...new Set(this.records.map(record => record.concepto))];
  }

  addRecord(record) {
    record.id = this.nextId++;
    this.records.push(record);
    
    // Update unique concepts if a new one is added
    if (!this.conceptos.includes(record.concepto)) {
      this.conceptos.push(record.concepto);
    }
    
    return record;
  }

  addConcepto(newConcepto) {
    if (!this.conceptos.includes(newConcepto)) {
      this.conceptos.push(newConcepto);
    }
    return this.conceptos;
  }

  updateRecord(id, updatedRecord) {
    const index = this.records.findIndex(r => r.id === id);
    if (index !== -1) {
      this.records[index] = { ...updatedRecord, id };
      
      // Update unique concepts
      this.conceptos = this.extractUniqueConcepts();
      
      return this.records[index];
    }
    return null;
  }

  deleteRecord(id) {
    const index = this.records.findIndex(r => r.id === id);
    if (index !== -1) {
      this.records.splice(index, 1);
      
      // Refresh unique concepts after deletion
      this.conceptos = this.extractUniqueConcepts();
      
      return true;
    }
    return false;
  }

  getAllRecords() {
    return [...this.records];
  }

  getAllConcepts() {
    return [...this.conceptos];
  }
}