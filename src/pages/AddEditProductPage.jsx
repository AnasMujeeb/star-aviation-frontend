import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProductAPI, updateProductAPI, getProductByIdAPI } from '../api/axios';
import { HiOutlineSave, HiOutlineArrowLeft } from 'react-icons/hi';

const categories = ['Engine Parts','Avionics','Hydraulics','Airframe','Landing Gear','Electrical','Fuel System','Pneumatics','Safety Equipment','Consumables','Tools','General'];
const conditions = ['New','Overhauled','Serviceable','Unserviceable','Repaired'];
const units = ['pcs','kg','liters','meters','sets','pairs','rolls'];

const emptyForm = {
  name: '', 
  category: 'General', 
  quantity: 0, 
  minStockLevel: 10,
  unit: 'pcs', 
  expiryDate: '', 
  manufacturingDate: '', 
  tsoDate: '', 
  batchNumber: '',
  partNumber: '', 
  serialNumber: '', 
  condition: 'New',
  location: 'Main Warehouse', 
  certificationRef: '', 
  notes: '',
  supplier: { name: '', contact: '', email: '' },
};

const AddEditProductPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      getProductByIdAPI(id)
        .then((res) => {
          const p = res.data.data;
          setForm({
            name: p.name || '',
            category: p.category || 'General',
            quantity: p.quantity || 0,
            minStockLevel: p.minStockLevel || 10,
            unit: p.unit || 'pcs',
            expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : '',
            manufacturingDate: p.manufacturingDate ? p.manufacturingDate.split('T')[0] : '',
            tsoDate: p.tsoDate ? p.tsoDate.split('T')[0] : '', // ✅ FIXED: Ab load hote waqt TSO Date yahan map hogi
            batchNumber: p.batchNumber || '',
            partNumber: p.partNumber || '',
            serialNumber: p.serialNumber || '',
            condition: p.condition || 'New',
            location: p.location || '',
            certificationRef: p.certificationRef || '',
            notes: p.notes || '',
            supplier: {
              name: p.supplier?.name || '',
              contact: p.supplier?.contact || '',
              email: p.supplier?.email || '',
            },
          });
        })
        .catch(() => setError('Failed to load product'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('supplier.')) {
      const field = name.split('.')[1];
      setForm((f) => ({ ...f, supplier: { ...f.supplier, [field]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        quantity: parseInt(form.quantity),
        minStockLevel: parseInt(form.minStockLevel),
      };

      // ✅ FIXED: Agar date select nahi ki toh backend par empty string bhejney ke bajaye delete kar do
      if (payload.tsoDate === '') {
        delete payload.tsoDate;
      }
      if (payload.manufacturingDate === '') {
        delete payload.manufacturingDate;
      }

      if (isEdit) {
        await updateProductAPI(id, payload);
        setSuccess('Product updated successfully!');
      } else {
        await createProductAPI(payload);
        setSuccess('Product created successfully!');
        setForm(emptyForm);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.map(e => e.msg).join(', ') || 'Operation failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div>
      <button className="btn btn-secondary" onClick={() => navigate('/products')} style={{ marginBottom: 20 }}>
        <HiOutlineArrowLeft /> Back to Products
      </button>

      <div className="card" style={{ maxWidth: 800 }}>
        <div className="card-header">
          <h3 className="card-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h3>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className="form-input" type="number" name="quantity" value={form.quantity} onChange={handleChange} min="0" required />
            </div>
            <div className="form-group">
              <label className="form-label">Min Stock Level</label>
              <input className="form-input" type="number" name="minStockLevel" value={form.minStockLevel} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date *</label>
              <input className="form-input" type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">TSN(Time Since New)</label>
              <input className="form-input" type="date" name="manufacturingDate" value={form.manufacturingDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">TSO (Time Since Overhauled)</label>
              <input 
                className="form-input" 
                type="date" 
                name="tsoDate" 
                value={form.tsoDate || ''} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Part Number</label>
              <input className="form-input" name="partNumber" value={form.partNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input className="form-input" name="serialNumber" value={form.serialNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" name="unit" value={form.unit} onChange={handleChange}>
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-select" name="condition" value={form.condition} onChange={handleChange}>
                {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Batch Number</label>
              <input className="form-input" name="batchNumber" value={form.batchNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" name="location" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Certification Ref</label>
              <input className="form-input" name="certificationRef" value={form.certificationRef} onChange={handleChange} placeholder="e.g. EASA Form 1" />
            </div>
          </div>

          <h4 style={{ margin: '24px 0 12px', fontSize: '0.95rem', fontWeight: 600 }}>Supplier Information</h4>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Supplier Name *</label>
              <input className="form-input" name="supplier.name" value={form.supplier.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact</label>
              <input className="form-input" name="supplier.contact" value={form.supplier.contact} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="supplier.email" value={form.supplier.email} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" name="notes" value={form.notes} onChange={handleChange} />
          </div>

          <div className="form-row">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <HiOutlineSave /> {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditProductPage;
