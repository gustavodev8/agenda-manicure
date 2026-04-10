import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useReservations } from "@/contexts/ReservationContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarX, Scissors, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MyReservations = () => {
  const navigate = useNavigate();
  const { bookings, cancelBooking } = useReservations();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const today = new Date().toISOString().split("T")[0];
  const upcoming = bookings.filter((b) => b.date >= today);
  const past = bookings.filter((b) => b.date < today);
  const displayed = tab === "upcoming" ? upcoming : past;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <h1 className="text-xl font-bold text-foreground mb-5">Meus Agendamentos</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-md p-1 mb-5">
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-sm transition-colors",
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "upcoming" ? `Próximos (${upcoming.length})` : `Passados (${past.length})`}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-16">
            <CalendarX className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((b) => (
              <div
                key={b.id}
                className="bg-card border border-border rounded-md overflow-hidden"
              >
                {/* Corpo principal */}
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">

                  {/* Info esquerda */}
                  <div className="space-y-1.5 min-w-0">
                    {/* Nome do cliente — peso maior */}
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <p className="font-semibold text-foreground text-sm leading-tight">{b.clientName}</p>
                    </div>
                    {/* Barbeiro */}
                    <div className="flex items-center gap-2">
                      <Scissors className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <p className="text-sm text-muted-foreground">{b.barberName}</p>
                    </div>
                    {/* Data e horário */}
                    <p className="text-xs text-muted-foreground/70 pl-[1.375rem]">
                      {b.date.split("-").reverse().join("/")} · {b.slot}
                    </p>
                  </div>

                  {/* Ações direita — sempre em coluna */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-[11px] font-semibold px-2.5 py-0.5 rounded-sm border",
                        tab === "upcoming"
                          ? "border-available/40 text-available bg-available/5"
                          : "border-border text-muted-foreground bg-muted/30"
                      )}
                    >
                      {tab === "upcoming" ? "Confirmado" : "Concluído"}
                    </span>
                    {tab === "upcoming" && (
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-unavailable transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                {/* Rodapé — serviço + valor */}
                <div className="border-t border-border bg-muted/20 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{b.serviceName}</span>
                  <span className="text-sm font-bold text-primary">R$ {b.servicePrice},00</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyReservations;
