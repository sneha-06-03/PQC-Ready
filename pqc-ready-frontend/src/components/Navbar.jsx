
import { Bell, Search, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/assets": "Asset Inventory",
    "/migration": "Migration Plan",
    "/secure-chat": "Secure Chat",
    "/benchmark": "Benchmarks",
    "/reports": "Reports",
  };

  const currentPage = pageTitles[location.pathname] || "Dashboard";

  return (
    <header className="w-full h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          {currentPage}
        </h2>
        <p className="text-sm text-slate-500">
          Welcome to your PQC-Ready workspace
        </p>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-slate-500 hover:text-blue-600">
          <Search size={21} />
        </button>

        <button className="relative text-slate-500 hover:text-blue-600">
          <Bell size={21} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
          <UserCircle size={35} className="text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Admin User
            </p>
            <p className="text-xs text-slate-500">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
