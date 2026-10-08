
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ROLE_ADMIN'

  async function onLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout">
      <aside className="sidebar">

        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-mark">A</span>

            <div>
              <strong>Abastix</strong>
              <span>Gestión</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <span className="nav-icon">⌂</span>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/productos"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <span className="nav-icon">▦</span>
              <span>Productos</span>
            </NavLink>

            <NavLink
              to="/categorias"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <span className="nav-icon">◫</span>
              <span>Categorías</span>
            </NavLink>

            <NavLink
              to="/clientes"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <span className="nav-icon">♙</span>
              <span>Clientes</span>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </div>

            <div className="sidebar-user-info">
              <strong>{user?.fullName}</strong>
              <span>{isAdmin ? 'Admin' : 'Empleado'}</span>
            </div>
          </div>

          <button
            className="logout-button"
            type="button"
            onClick={onLogout}
          >
            <span>↪</span>
            Cerrar sesión
          </button>
        </div>

      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}




