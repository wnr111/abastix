
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('admin@abastix.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      await login(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.message ?? 'No se pudo iniciar sesión'
      )
    }
  }

  return (
    <main className="login-page">
      {/* Brand panel */}
      <section className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <div className="brand-icon">A</div>
            <span>Abastix</span>
          </div>

          <div className="brand-copy">
            <span className="eyebrow">GESTIÓN PARA TU NEGOCIO</span>

            <h1>
              Todo tu negocio,
              <br />
              <span>en un solo lugar.</span>
            </h1>

            <p>
              Controla tus productos, inventario, ventas y pedidos
              desde una plataforma simple pensada para bodegas y
              comercios.
            </p>
          </div>

          <div className="feature-list">
            <div className="feature">
              <div className="feature-icon">✓</div>
              <div>
                <strong>Inventario bajo control</strong>
                <span>Conoce tus existencias en tiempo real.</span>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">✓</div>
              <div>
                <strong>Ventas más simples</strong>
                <span>Registra y organiza tus ventas fácilmente.</span>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">✓</div>
              <div>
                <strong>Pedidos centralizados</strong>
                <span>Administra tus pedidos desde un solo lugar.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          <span>Abastix</span>
          <span>•</span>
          <span>Gestión simple para negocios reales</span>
        </div>
      </section>

      {/* Login panel */}
      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-logo">
            <div className="brand-icon">A</div>
            <span>Abastix</span>
          </div>

          <div className="login-header">
            <span className="welcome">BIENVENIDO</span>

            <h2>Inicia sesión</h2>

            <p>
              Ingresa a tu cuenta para continuar administrando
              tu negocio.
            </p>
          </div>

          <form onSubmit={onSubmit} className="login-form">
            <label>
              <span>Correo electrónico</span>

              <div className="input-wrapper">
                <span className="input-icon">@</span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@negocio.com"
                  required
                  autoComplete="username"
                />
              </div>
            </label>

            <label>
              <div className="label-row">
                <span>Contraseña</span>
                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => {}}
                >
                  ¿La olvidaste?
                </button>
              </div>

              <div className="input-wrapper">
                <span className="input-icon">•••</span>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  autoComplete="current-password"
                />
              </div>
            </label>

            {error && (
              <div className="login-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar a Abastix
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="demo-box">
            <div className="demo-header">
              <span className="demo-icon">⚡</span>
              <div>
                <strong>Accesos de prueba</strong>
                <span>Para explorar el sistema</span>
              </div>
            </div>

            <div className="demo-user">
              <div>
                <strong>Administrador</strong>
                <span>admin@abastix.com</span>
              </div>

              <code>123456</code>
            </div>

            <div className="demo-user">
              <div>
                <strong>Empleado</strong>
                <span>empleado@abastix.com</span>
              </div>

              <code>123456</code>
            </div>
          </div>

          <p className="security-note">
            Tus datos están protegidos y solo son accesibles
            por los usuarios autorizados de tu negocio.
          </p>
        </div>
      </section>
    </main>
  )
}

