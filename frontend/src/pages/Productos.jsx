
import { useEffect, useState } from 'react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import ProductoModal from '../components/ProductoModal.jsx'

export default function Productos() {
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

      const { data } = await api.get('/api/products', { params })

      setItems(data)
    } catch (err) {
      setError(
        err.response?.data?.message ??
        'Error al cargar productos'
      )
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function onToggle(p) {
    const action = p.active ? 'deactivate' : 'activate'
    const label = p.active ? 'Desactivar' : 'Activar'

    if (!window.confirm(`¿${label} este producto?`)) return

    try {
      await api.patch(`/api/products/${p.id}/${action}`)
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
    <main className="products-page">
      <div className="products-container">

        <header className="products-header">
          <div>
            <span className="products-eyebrow">
              CATÁLOGO
            </span>

            <h1>Productos</h1>

            <p>
              Administra los productos registrados en Abastix.
            </p>
          </div>

          <div className="products-actions">

            {isAdmin && (
              <select
                className="products-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            )}

            {isAdmin && (
              <button
                type="button"
                className="primary-button"
                onClick={() => setModal({ mode: 'create' })}
              >
                <span>+</span>
                Nuevo producto
              </button>
            )}

          </div>
        </header>

        {error && (
          <div className="products-error">
            <span>!</span>

            <div>
              <strong>No se pudo completar la operación</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <section className="products-card">

          <div className="products-card-head">
            <div>
              <strong>Lista de productos</strong>
              <span>
                {items.length} {items.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
          </div>

          <div className="products-table-wrap">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  {isAdmin && <th>Acciones</th>}
                </tr>
              </thead>

              <tbody>
                {items.map((p) => (
                  <tr
                    key={p.id}
                    className={p.active ? '' : 'inactive'}
                  >
                    <td>
                      <div className="product-name">
                        <strong>{p.name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="product-sku">
                        {p.sku}
                      </span>
                    </td>

                    <td>
                      <span className="product-category">
                        {p.categoryName}
                      </span>
                    </td>

                    <td>
                      <strong className="product-price">
                        S/ {Number(p.price).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      <div className="stock-cell">
                        <span>{p.stock}</span>

                        {p.stock <= p.minStock && (
                          <span className="stock-warning">
                            bajo
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          p.active
                            ? 'status-badge active'
                            : 'status-badge inactive'
                        }
                      >
                        <span />
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {isAdmin && (
                      <td>
                        <div className="product-row-actions">

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              setModal({
                                mode: 'edit',
                                item: p,
                              })
                            }
                          >
                            Editar
                          </button>

                          {p.active ? (
                            <button
                              type="button"
                              className="danger-button"
                              onClick={() => onToggle(p)}
                            >
                              Desactivar
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="activate-button"
                              onClick={() => onToggle(p)}
                            >
                              Activar
                            </button>
                          )}

                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={isAdmin ? 7 : 6}
                      className="products-empty"
                    >
                      No hay productos para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>

      </div>

      {modal && (
        <ProductoModal
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

