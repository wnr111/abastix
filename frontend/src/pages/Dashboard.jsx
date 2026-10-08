
import { useEffect, useState } from 'react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [me, setMe] = useState(user)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/auth/me')
      .then((res) => {
        setMe(res.data)
        setError('')
      })
      .catch((err) => {
        const status = err.response?.status
        const msg = err.response?.data?.message ?? err.message

        setError(
          status
            ? `Error ${status}: ${msg}`
            : `Error: ${msg}`
        )
      })
  }, [])

  return (
    <main className="dashboard-page">
      <section className="dashboard-container">

        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              PANEL PRINCIPAL
            </span>

            <h1>Dashboard</h1>

            <p>
              Bienvenido nuevamente a Abastix.
            </p>
          </div>

          {me && (
            <div className="dashboard-user">
              <div className="dashboard-avatar">
                {me.fullName?.charAt(0)?.toUpperCase()}
              </div>

              <div>
                <strong>{me.fullName}</strong>
                <span>{me.role}</span>
              </div>
            </div>
          )}
        </header>

        {error && (
          <div className="dashboard-error">
            <span>!</span>

            <div>
              <strong>No se pudo cargar la información</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {me ? (
          <section className="profile-card">

            <div className="profile-card-header">
              <div>
                <span className="card-eyebrow">
                  CUENTA
                </span>

                <h2>Información de usuario</h2>

                <p>
                  Datos de la cuenta con la que has iniciado
                  sesión.
                </p>
              </div>

              <div className="profile-status">
                <span />
                Sesión activa
              </div>
            </div>

            <div className="profile-divider" />

            <div className="profile-data">

              <div className="profile-field">
                <span>Nombre completo</span>

                <strong>{me.fullName}</strong>
              </div>

              <div className="profile-field">
                <span>Correo electrónico</span>

                <strong>{me.email}</strong>
              </div>

              <div className="profile-field">
                <span>Rol</span>

                <strong className="role-badge">
                  {me.role}
                </strong>
              </div>

            </div>
          </section>
        ) : (
          <section className="loading-card">
            <div className="loading-spinner" />

            <div>
              <strong>Cargando información</strong>
              <p>
                Estamos obteniendo los datos de tu cuenta...
              </p>
            </div>
          </section>
        )}

      </section>
    </main>
  )
}
