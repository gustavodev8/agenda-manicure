import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { barbeiros } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          Escolha seu barbeiro
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Selecione um profissional para iniciar o agendamento
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {barbeiros.map((barber) => (
            <button
              key={barber.id}
              onClick={() => navigate(`/barbeiros/${barber.id}`)}
              className="bg-card border border-border rounded-lg overflow-hidden text-left hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="overflow-hidden">
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground">{barber.name}</span>
                  <Badge
                    variant="outline"
                    className={
                      barber.available
                        ? "border-available text-available text-xs"
                        : "border-unavailable text-unavailable text-xs"
                    }
                  >
                    {barber.available ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{barber.description}</p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
