import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logout } from "../../store/features/authSlice";

const NAV = [
  {
    to: "/admin",
    end: true,
    label: "Overview",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <rect
          x="1"
          y="1"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <rect
          x="9"
          y="1"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <rect
          x="1"
          y="9"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <rect
          x="9"
          y="9"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: "/admin/enrollments",
    label: "Enrollments",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 4h12M2 8h8M2 12h10"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: "/admin/statements",
    label: "Statements",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 3h10v2H3zM3 7h10v2H3zM3 11h6v2H3z"
          fill="currentColor"
          opacity=".7"
        />
      </svg>
    ),
  },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-navy">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col bg-[#111827] border-r border-white/8">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
          <div className="w-7 h-7 border border-gold/80 rounded-md flex items-center justify-center relative">
            <div className="absolute inset-1 bg-gold/20 rounded-sm" />
            <div className="w-2 h-2 bg-gold rounded-sm relative z-10" />
          </div>
          <div>
            <p className="text-[0.65rem] font-medium tracking-[0.14em] uppercase text-[#4a5168]">
              Admin
            </p>
            <p className="text-xs text-[#7b8399] font-medium leading-tight">
              Control Panel
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV.map(({ to, end, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-gold/10 text-gold"
                    : "text-[#4a5168] hover:text-[#7b8399] hover:bg-white/3"
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-white/8">
          <p className="text-xs text-[#7b8399] truncate mb-0.5">
            {user?.username}
          </p>
          <p className="text-[0.65rem] text-[#4a5168] truncate mb-3">
            {user?.email}
          </p>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-xs text-[#e05c5c] border border-[#e05c5c]/20 rounded-lg transition-all duration-200 hover:bg-[#e05c5c]/10 hover:border-[#e05c5c]/40"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
