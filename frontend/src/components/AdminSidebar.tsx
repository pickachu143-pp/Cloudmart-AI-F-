import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, Tags, ClipboardList, Users } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/users", label: "Users", icon: Users },
];

const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-full md:w-56 shrink-0">
      <nav className="card p-2 flex md:flex-col gap-1 overflow-x-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
