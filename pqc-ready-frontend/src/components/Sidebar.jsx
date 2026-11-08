
import { NavLink, useNavigate } from "react-router-dom";
import {
  Atom,
  LayoutDashboard,
  Boxes,
  ShieldCheck,
  MessageSquare,
  ChartNoAxesColumn,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Asset Inventory", path: "/assets", icon: Boxes },
    { name: "Migration Plan", path: "/migration", icon: ShieldCheck },
    { name: "Secure Chat", path: "/secure-chat", icon: MessageSquare },
    { name: "Benchmarks", path: "/benchmark", icon: ChartNoAxesColumn },
    { name: "Reports", path: "/reports", icon: FileText },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white flex flex-col border-r border-slate-800">

      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Atom size={25} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">PQC-Ready</h1>
          <p className="text-xs text-slate-400">Quantum-Safe Security</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <p className="text-xs uppercase tracking-widest text-slate-500 px-3 mb-4">
          Main Menu
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-5 border-t border-slate-800 space-y-2">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
          <Settings size={19} />
          Settings
        </button>

        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;
