
import { useEffect, useState } from 'react'
import api from '../api/axios.js'

const empty = {
  categoryId: '',
  name: '',
  sku: '',
  price: '',
  stock: '',
  minStock: '',
}

export default function ProductoModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(empty)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .get('/api/categories')
      .then((res) => setCategories(res.data.filter((c) => c.active)))
      .catch(() => setCategories([]))

    if (initial) {
      setForm({
        categoryId: String(initial.categoryId),
        name: initial.name,
        sku: initial.sku,
        price: String(initial.price),
        stock: String(initial.stock),
        minStock: String(initial.minStock),
      })
    } else {
      setForm(empty)
    }
  }, [initial])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const payload = {
        categoryId: Number(form.categoryId),
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
      }

      if (initial) {
        await api.put(`/api/products/${initial.id}`, payload)
      } else {
        await api.post('/api/products', payload)
      }

      onSaved()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal product-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">
              {initial ? 'PRODUCTO' : 'NUEVO REGISTRO'}
            </span>

            <h2>
              {initial ? 'Editar producto' : 'Nuevo producto'}
            </h2>

            <p>
              {initial
                ? 'Actualiza la información del producto.'
                : 'Completa la información para registrar el producto.'}
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="modal-body">

          <label className="modal-field">
            <span>Categoría</span>

            <select
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              required
            >
              <option value="">Seleccionar...</option>

              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="modal-field">
            <span>Nombre</span>

            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
              maxLength={150}
              placeholder="Nombre del producto"
            />
          </label>

          <label className="modal-field">
            <span>SKU</span>

            <input
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              required
              maxLength={50}
              placeholder="Código SKU"
            />
          </label>

          <div className="modal-grid-3">

            <label className="modal-field">
              <span>Precio</span>

              <div className="input-prefix">
                <span>S/</span>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="modal-field">
              <span>Stock</span>

              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                required
              />
            </label>

            <label className="modal-field">
              <span>Stock mín.</span>

              <input
                type="number"
                min="0"
                value={form.minStock}
                onChange={(e) => set('minStock', e.target.value)}
                required
              />
            </label>

          </div>

          {error && (
            <div className="modal-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>

          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
