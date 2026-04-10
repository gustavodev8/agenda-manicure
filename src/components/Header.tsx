import { CalendarDays, LayoutDashboard, Scissors } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 font-sans font-bold text-lg text-foreground tracking-tight"
      >
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Scissors className="w-4 h-4 text-primary-foreground" />
        </div>
        Barber Time
      </button>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/meus-agendamentos")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <CalendarDays className="w-4 h-4" />
          <span className="hidden sm:inline">Meus Agendamentos</span>
        </button>
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
          title="Painel Admin"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Admin</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
