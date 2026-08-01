import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LOGO_URL } from "@/lib/site";
import { LayoutDashboard, Building2, Users, Inbox, LogOut, BookOpen } from "lucide-react";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const items = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/properties", label: "Properties", icon: Building2 },
    { to: "/admin/blogs", label: "Blogs", icon: BookOpen },
    { to: "/admin/leads", label: "Leads", icon: Inbox },
    ...(user?.role === "admin" ? [{ to: "/admin/users", label: "Users", icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-charcoal">
      <aside data-testid="admin-sidebar" className="w-64 border-r border-copper/15 bg-charcoal-2/30 flex flex-col">
        <div className="p-6 border-b border-copper/15">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Astittva" className="h-10 w-10 object-contain" />
            <div className="leading-tight">
              <div className="text-ivory font-display tracking-[0.25em] text-xs">ASTITTVA</div>
              <div className="text-copper text-[10px] tracking-[0.4em]">ADMIN</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              data-testid={`nav-admin-${it.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-xs tracking-[0.2em] uppercase transition ${
                  isActive ? "bg-copper/10 text-copper border-l-2 border-copper" : "text-ivory/65 hover:text-ivory hover:bg-charcoal-2/60"
                }`
              }
            >
              <it.icon className="w-4 h-4" strokeWidth={1.5} />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-copper/15">
          <div className="px-2 mb-3">
            <div className="text-ivory text-sm">{user?.name}</div>
            <div className="text-copper text-[10px] tracking-[0.3em] uppercase">{user?.role}</div>
          </div>
          <button
            onClick={onLogout}
            data-testid="admin-logout"
            className="flex items-center gap-2 text-ivory/60 hover:text-copper text-xs tracking-[0.2em] uppercase px-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
