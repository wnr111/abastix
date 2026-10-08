
import { useEffect, useState } from 'react'
import api from '../api/axios.js'

const empty = {
  fullName: '',
  document: '',
  phone: '',
  email: '',
}

export default function ClienteModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initial) {
      setForm({
        fullName: initial.fullName ?? '',
        document: initial.document ?? '',
        phone: initial.phone ?? '',
        email: initial.email ?? '',
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
        fullName: form.fullName.trim(),
        document: form.document.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
      }

      if (initial) {
        await api.put(`/api/customers/${initial.id}`, payload)
      } else {
        await api.post('/api/customers', payload)
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
        className="modal customer-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">
              {initial ? 'CLIENTE' : 'NUEVO REGISTRO'}
            </span>

            <h2>
              {initial ? 'Editar cliente' : 'Nuevo cliente'}
            </h2>

            <p>
              {initial
                ? 'Actualiza la información del cliente.'
                : 'Completa la información para registrar el cliente.'}
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
            <span>Nombre completo</span>

            <input
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              required
              maxLength={150}
              placeholder="Nombre completo"
            />
          </label>

          <label className="modal-field">
            <span>Documento</span>

            <input
              value={form.document}
              onChange={(e) => set('document', e.target.value)}
              required
              maxLength={30}
              placeholder="Número de documento"
            />
          </label>

          <div className="modal-grid-2">

            <label className="modal-field">
              <span>Teléfono</span>

              <input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                maxLength={30}
                placeholder="Teléfono"
              />
            </label>

            <label className="modal-field">
              <span>Email</span>

              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                maxLength={150}
                placeholder="Correo electrónico"
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

