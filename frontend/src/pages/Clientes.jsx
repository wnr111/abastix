
import { useEffect, useState } from 'react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import ClienteModal from '../components/ClienteModal.jsx'

export default function Clientes() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ROLE_ADMIN'

  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)

  async function load() {
    setError('')

    try {
      const params =
        isAdmin && filter !== 'all'
          ? { active: filter === 'active' }
          : {}

      const { data } = await api.get('/api/customers', { params })

      setItems(data)
    } catch (err) {
      setError(
        err.response?.data?.message ??
        'Error al cargar clientes'
      )
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function onToggle(c) {
    const action = c.active ? 'deactivate' : 'activate'
    const label = c.active ? 'Desactivar' : 'Activar'

    if (!window.confirm(`¿${label} este cliente?`)) return

    try {
      await api.patch(`/api/customers/${c.id}/${action}`)
      load()
    } catch (err) {
      const status = err.response?.status

      const msg =
        err.response?.data?.message ??
        (
          err.request
            ? 'Sin respuesta del servidor (red/CORS)'
            : err.message
        )

      setError(
        status
          ? `Error ${status}: ${msg}`
          : `Error al cambiar estado: ${msg}`
      )
    }
  }

  return (
    <main className="customers-page">
      <div className="customers-container">

        <header className="customers-header">
          <div>
            <span className="customers-eyebrow">
              CLIENTES
            </span>

            <h1>Clientes</h1>

            <p>
              Administra los clientes registrados en Abastix.
            </p>
          </div>

          <div className="customers-actions">

            {isAdmin && (
              <select
                className="customers-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            )}

            <button
              type="button"
              className="primary-button"
              onClick={() => setModal({ mode: 'create' })}
            >
              <span>+</span>
              Nuevo cliente
            </button>

          </div>
        </header>

        {error && (
          <div className="customers-error">
            <span>!</span>

            <div>
              <strong>No se pudo completar la operación</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <section className="customers-card">

          <div className="customers-card-head">
            <div>
              <strong>Lista de clientes</strong>

              <span>
                {items.length}{' '}
                {items.length === 1 ? 'cliente' : 'clientes'}
              </span>
            </div>
          </div>

          <div className="customers-table-wrap">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {items.map((c) => (
                  <tr
                    key={c.id}
                    className={c.active ? '' : 'inactive'}
                  >
                    <td>
                      <div className="customer-name">
                        <strong>{c.fullName}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="customer-document">
                        {c.document}
                      </span>
                    </td>

                    <td>
                      <span className="customer-contact">
                        {c.phone ?? '-'}
                      </span>
                    </td>

                    <td>
                      <span className="customer-contact">
                        {c.email ?? '-'}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          c.active
                            ? 'status-badge active'
                            : 'status-badge inactive'
                        }
                      >
                        <span />
                        {c.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td>
                      <div className="customer-row-actions">

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            setModal({
                              mode: 'edit',
                              item: c,
                            })
                          }
                        >
                          Editar
                        </button>

                        {isAdmin &&
                          (c.active ? (
                            <button
                              type="button"
                              className="danger-button"
                              onClick={() => onToggle(c)}
                            >
                              Desactivar
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="activate-button"
                              onClick={() => onToggle(c)}
                            >
                              Activar
                            </button>
                          ))}

                      </div>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="customers-empty"
                    >
                      No hay clientes para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>

      </div>

      {modal && (
        <ClienteModal
          initial={
            modal.mode === 'edit'
              ? modal.item
              : null
          }
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            load()
          }}
        />
      )}

    </main>
  )
}

