import { GraduationCap, LayoutDashboard, Users, Building2, BookOpen, UsersRound, CalendarRange } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/",            label: "Dashboard",   icon: LayoutDashboard },
  { to: "/professores", label: "Professores", icon: Users },
  { to: "/salas",       label: "Salas",       icon: Building2 },
  { to: "/disciplinas", label: "Disciplinas", icon: BookOpen },
  { to: "/turmas",      label: "Turmas",      icon: UsersRound },
  { to: "/grade",       label: "Grade",       icon: CalendarRange },
];

const Header = () => (
  <header className="bg-card border-b border-border px-4 py-0 flex items-stretch justify-between sticky top-0 z-40">
    {/* Logo */}
    <NavLink
      to="/"
      className="flex items-center gap-2 font-bold text-base text-foreground tracking-tight py-3 mr-6"
    >
      <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <GraduationCap className="w-4 h-4 text-primary-foreground" />
      </div>
      <span className="hidden sm:inline">SmartSchedule</span>
    </NavLink>

    {/* Nav links */}
    <nav className="flex items-stretch gap-0.5 overflow-x-auto">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-1.5 px-3 text-sm transition-colors border-b-2 whitespace-nowrap",
              isActive
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted",
            )
          }
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">{label}</span>
        </NavLink>
      ))}
    </nav>
  </header>
);

export default Header;
