
import { useEffect, useState } from 'react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Categorias() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ROLE_ADMIN'

  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    setError('')

    try {
      const { data } = await api.get('/api/categories')
      setItems(data)
    } catch (err) {
      setError(
        err.response?.data?.message ??
        'Error al cargar categorías'
      )
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function onCreate(e) {
    e.preventDefault()
    setError('')

    try {
      await api.post('/api/categories', {
        name: name.trim(),
      })

      setName('')
      load()
    } catch (err) {
      setError(
        err.response?.data?.message ??
        'Error al crear'
      )
    }
  }

  async function onUpdate(e) {
    e.preventDefault()
    setError('')

    try {
      await api.put(
        `/api/categories/${editing.id}`,
        {
          name: editing.name.trim(),
        }
      )

      setEditing(null)
      load()
    } catch (err) {
      setError(
        err.response?.data?.message ??
        'Error al actualizar'
      )
    }
  }

  async function onToggle(c) {
    const action = c.active
      ? 'deactivate'
      : 'activate'

    const label = c.active
      ? 'Desactivar'
      : 'Activar'

    if (!window.confirm(`¿${label} esta categoría?`)) {
      return
    }

    try {
      await api.patch(
        `/api/categories/${c.id}/${action}`
      )

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
    <main className="categories-page">
      <div className="categories-container">

        <header className="categories-header">
          <div>
            <span className="categories-eyebrow">
              CATÁLOGO
            </span>

            <h1>Categorías</h1>

            <p>
              Administra las categorías registradas en Abastix.
            </p>
          </div>
        </header>

        {error && (
          <div className="categories-error">
            <span>!</span>

            <div>
              <strong>No se pudo completar la operación</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {isAdmin && (
          <section className="category-form-card">

            <div className="category-form-info">
              <span>
                {editing ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}
              </span>

              <strong>
                {editing
                  ? 'Actualizar categoría'
                  : 'Crear categoría'}
              </strong>

              <p>
                {editing
                  ? 'Modifica el nombre de la categoría seleccionada.'
                  : 'Ingresa un nombre para registrar una nueva categoría.'}
              </p>
            </div>

            <form
              className="category-form"
              onSubmit={editing ? onUpdate : onCreate}
            >
              <input
                placeholder="Nombre de categoría"
                value={editing ? editing.name : name}
                onChange={(e) =>
                  editing
                    ? setEditing({
                        ...editing,
                        name: e.target.value,
                      })
                    : setName(e.target.value)
                }
                required
                maxLength={100}
              />

              <button type="submit" className="primary-button">
                {editing ? 'Actualizar' : 'Crear'}
              </button>

              {editing && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </button>
              )}
            </form>

          </section>
        )}

        <section className="categories-card">

          <div className="categories-card-head">
            <div>
              <strong>Lista de categorías</strong>

              <span>
                {items.length}{' '}
                {items.length === 1
                  ? 'categoría'
                  : 'categorías'}
              </span>
            </div>
          </div>

          <div className="categories-table-wrap">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  {isAdmin && <th>Acciones</th>}
                </tr>
              </thead>

              <tbody>
                {items.map((c) => (
                  <tr
                    key={c.id}
                    className={c.active ? '' : 'inactive'}
                  >
                    <td>
                      <strong className="category-name">
                        {c.name}
                      </strong>
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
                        {c.active
                          ? 'Activa'
                          : 'Inactiva'}
                      </span>
                    </td>

                    {isAdmin && (
                      <td>
                        <div className="category-row-actions">

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              setEditing({
                                id: c.id,
                                name: c.name,
                              })
                            }
                          >
                            Editar
                          </button>

                          {c.active ? (
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
                          )}

                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={isAdmin ? 3 : 2}
                      className="categories-empty"
                    >
                      No hay categorías para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>

      </div>
    </main>
  )
}


