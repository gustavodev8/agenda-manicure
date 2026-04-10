import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReservations } from "@/contexts/ReservationContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Scissors,
  CalendarDays,
  TrendingUp,
  Users,
  DollarSign,
  ArrowLeft,
  Star,
  Clock,
  AlertTriangle,
  UserX,
  ShieldAlert,
  X,
  UserCheck,
  Timer,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type BookingStatus =
  | "concluido"
  | "confirmado"
  | "cancelado"
  | "reagendamento"
  | "nao_compareceu";

interface AdminBooking {
  id: string;
  slot: string;
  clientName: string;
  barberId: string;
  barberName: string;
  serviceName: string;
  servicePrice: number;
  status: BookingStatus;
}

interface BarberInfo {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
}

// ─── Dados mock ──────────────────────────────────────────────────────────────

const TODAY_MOCK: AdminBooking[] = [
  { id: "m1", slot: "09:00 – 09:30", clientName: "João Pereira",  barberId: "b1", barberName: "Carlos Silva",   serviceName: "Degradê",              servicePrice: 40, status: "concluido"  },
  { id: "m2", slot: "09:30 – 10:00", clientName: "Lucas Oliveira",barberId: "b2", barberName: "Rafael Mendes",  serviceName: "Corte Clássico",       servicePrice: 35, status: "concluido"  },
  { id: "m3", slot: "10:00 – 10:30", clientName: "Pedro Costa",   barberId: "b3", barberName: "Diego Santos",   serviceName: "Barba",                servicePrice: 25, status: "concluido"  },
  { id: "m4", slot: "10:30 – 11:00", clientName: "Marcos Lima",   barberId: "b4", barberName: "Lucas Ferreira", serviceName: "Combo (Corte + Barba)", servicePrice: 55, status: "concluido"  },
  { id: "m5", slot: "11:00 – 11:30", clientName: "André Santos",  barberId: "b1", barberName: "Carlos Silva",   serviceName: "Hidratação Capilar",   servicePrice: 30, status: "concluido"  },
  { id: "m6", slot: "14:00 – 14:30", clientName: "Felipe Torres", barberId: "b2", barberName: "Rafael Mendes",  serviceName: "Degradê",              servicePrice: 40, status: "confirmado" },
  { id: "m7", slot: "14:30 – 15:00", clientName: "Gabriel Rocha", barberId: "b3", barberName: "Diego Santos",   serviceName: "Corte Clássico",       servicePrice: 35, status: "confirmado" },
  { id: "m8", slot: "15:00 – 15:30", clientName: "Rodrigo Alves", barberId: "b4", barberName: "Lucas Ferreira", serviceName: "Barba",                servicePrice: 25, status: "confirmado" },
  { id: "m9", slot: "16:00 – 16:30", clientName: "Bruno Martins", barberId: "b1", barberName: "Carlos Silva",   serviceName: "Combo (Corte + Barba)", servicePrice: 55, status: "confirmado" },
];

const BARBERS_MOCK: BarberInfo[] = [
  { id: "b1", name: "Carlos Silva",   bookings: 3, revenue: 125 },
  { id: "b2", name: "Rafael Mendes",  bookings: 2, revenue: 75  },
  { id: "b3", name: "Diego Santos",   bookings: 2, revenue: 60  },
  { id: "b4", name: "Lucas Ferreira", bookings: 2, revenue: 80  },
];

// ─── Configuração de status ───────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  concluido:       { label: "Concluído",       className: "bg-available/10 text-available border-available/30" },
  confirmado:      { label: "Confirmado",      className: "bg-primary/10 text-primary border-primary/30" },
  cancelado:       { label: "Cancelado",       className: "bg-unavailable/10 text-unavailable border-unavailable/30" },
  reagendamento:   { label: "Reagendamento",   className: "bg-orange-100 text-orange-600 border-orange-300" },
  nao_compareceu:  { label: "Não compareceu",  className: "bg-gray-100 text-gray-500 border-gray-300" },
};

// ─── Componente principal ─────────────────────────────────────────────────────

const AdminPage = () => {
  const navigate = useNavigate();
  const { bookings } = useReservations();

  // Estados de controle de ocorrências
  const [absentBarbers, setAbsentBarbers]     = useState<Set<string>>(new Set());
  const [lateBarbers, setLateBarbers]         = useState<Set<string>>(new Set());
  const [overrideStatus, setOverrideStatus]   = useState<Record<string, BookingStatus>>({});
  const [emergencyClosed, setEmergencyClosed] = useState(false);
  const [statusFilter, setStatusFilter]       = useState<BookingStatus | "todos">("todos");

  // Modal de confirmação genérico
  const [confirm, setConfirm] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Agendamentos reais do dia
  const realToday: AdminBooking[] = bookings
    .filter((b) => b.date === todayStr)
    .map((b) => ({
      id: b.id, slot: b.slot,
      clientName: b.clientName,
      barberId: "",
      barberName: b.barberName,
      serviceName: b.serviceName,
      servicePrice: b.servicePrice,
      status: "confirmado" as BookingStatus,
    }));

  // Aplica regras de ocorrências sobre os agendamentos
  const allToday: AdminBooking[] = [...realToday, ...TODAY_MOCK].map((b) => {
    if (overrideStatus[b.id])            return { ...b, status: overrideStatus[b.id] };
    if (emergencyClosed)                 return { ...b, status: "cancelado" };
    if (absentBarbers.has(b.barberId) && b.status === "confirmado")
                                         return { ...b, status: "reagendamento" };
    return b;
  });

  const filtered = statusFilter === "todos"
    ? allToday
    : allToday.filter((b) => b.status === statusFilter);

  // Métricas
  const concluded        = allToday.filter((b) => b.status === "concluido").length;
  const upcoming         = allToday.filter((b) => b.status === "confirmado").length;
  const needsReschedule  = allToday.filter((b) => b.status === "reagendamento").length;
  const noShowFees       = allToday
    .filter((b) => b.status === "nao_compareceu")
    .reduce((s, b) => s + Math.round(b.servicePrice * 0.5), 0);
  const revenueRealized  = allToday
    .filter((b) => b.status === "concluido")
    .reduce((s, b) => s + b.servicePrice, 0) + noShowFees;

  // Ações de ocorrência
  const markAbsent = (barber: BarberInfo) => {
    const affected = allToday.filter(
      (b) => b.barberId === barber.id && b.status === "confirmado"
    ).length;
    setConfirm({
      title: `Marcar ${barber.name.split(" ")[0]} como ausente`,
      description: `${barber.name} tem ${affected} agendamento${affected !== 1 ? "s" : ""} pendente${affected !== 1 ? "s" : ""} hoje. Eles serão sinalizados como "Reagendamento necessário" e os clientes precisarão ser contatados.`,
      onConfirm: () => setAbsentBarbers((prev) => new Set(prev).add(barber.id)),
    });
  };

  const markLate = (barber: BarberInfo) => {
    setConfirm({
      title: `Registrar atraso — ${barber.name.split(" ")[0]}`,
      description: `${barber.name} está com atraso. O primeiro horário disponível poderá ser impactado. O aviso ficará visível na agenda do dia.`,
      onConfirm: () => setLateBarbers((prev) => new Set(prev).add(barber.id)),
    });
  };

  const restoreBarber = (barberId: string) => {
    setAbsentBarbers((prev) => { const s = new Set(prev); s.delete(barberId); return s; });
    setLateBarbers((prev)   => { const s = new Set(prev); s.delete(barberId); return s; });
    setOverrideStatus((prev) => {
      const next = { ...prev };
      TODAY_MOCK.filter((b) => b.barberId === barberId && b.status === "confirmado")
        .forEach((b) => delete next[b.id]);
      return next;
    });
  };

  const markNoShow = (bookingId: string, clientName: string, servicePrice: number) => {
    const fee = Math.round(servicePrice * 0.5);
    setConfirm({
      title: "Registrar não comparecimento",
      description: `${clientName} não compareceu ao agendamento. Uma taxa de 50% (R$ ${fee},00) será cobrada pelo horário reservado e perdido.`,
      onConfirm: () => setOverrideStatus((prev) => ({ ...prev, [bookingId]: "nao_compareceu" })),
    });
  };

  const markEmergencyClosed = () => {
    setConfirm({
      title: "Fechamento emergencial",
      description: "Todos os agendamentos de hoje serão cancelados. Esta ação representa uma situação excepcional (falta de energia, problema estrutural, etc.). Todos os clientes precisarão ser contatados para reembolso ou reagendamento.",
      onConfirm: () => setEmergencyClosed(true),
    });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header Admin ── */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center shrink-0">
            <Scissors className="w-4 h-4 text-background" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground leading-tight">Barber Time</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">Painel Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block capitalize">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </span>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver site</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── Banner de fechamento emergencial ── */}
        {emergencyClosed && (
          <div className="flex items-center justify-between gap-3 bg-unavailable/10 border border-unavailable/30 rounded-md px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-unavailable shrink-0" />
              <p className="text-sm font-semibold text-unavailable">
                Fechamento emergencial ativo — todos os agendamentos de hoje estão cancelados.
              </p>
            </div>
            <button
              onClick={() => setEmergencyClosed(false)}
              className="text-xs text-unavailable hover:underline shrink-0"
            >
              Reverter
            </button>
          </div>
        )}

        {/* ── Alertas de reagendamento ── */}
        {needsReschedule > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-md px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
            <p className="text-sm text-orange-700">
              <strong>{needsReschedule} agendamento{needsReschedule > 1 ? "s" : ""}</strong> precisam de reagendamento devido à ausência de barbeiro.
            </p>
          </div>
        )}

        {/* ── Métricas do dia ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Hoje</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard icon={<CalendarDays className="w-4 h-4" />} label="Agendamentos" value={String(allToday.length)}
              sub={`${concluded} concluídos · ${upcoming} a seguir`} />
            <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Receita realizada" value={`R$ ${revenueRealized}`}
              sub={noShowFees > 0 ? `${concluded} serviços · R$ ${noShowFees} em taxas` : `${concluded} serviços concluídos`} highlight />
            <MetricCard icon={<TrendingUp className="w-4 h-4" />} label="Receita do mês" value="R$ 6.840"
              sub="↑ 12% vs mês anterior" />
            <MetricCard icon={<Users className="w-4 h-4" />} label="Clientes no mês" value="52"
              sub="Serviço top: Degradê" />
          </div>
        </section>

        {/* ── Barbeiros — status e gestão de ocorrências ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Barbeiros hoje</p>
            <button
              onClick={markEmergencyClosed}
              disabled={emergencyClosed}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-unavailable hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Fechamento emergencial
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BARBERS_MOCK.map((b) => {
              const isAbsent = absentBarbers.has(b.id);
              const isLate   = lateBarbers.has(b.id);
              const affected = allToday.filter(
                (a) => a.barberId === b.id && (a.status === "confirmado" || a.status === "reagendamento")
              ).length;

              return (
                <div
                  key={b.id}
                  className={cn(
                    "bg-card border rounded-md px-4 py-3 transition-all",
                    isAbsent ? "border-orange-300 bg-orange-50/50" : "border-border",
                    isLate   && !isAbsent ? "border-yellow-300 bg-yellow-50/40" : ""
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                        isAbsent ? "bg-orange-100" : "bg-primary/10"
                      )}>
                        <Scissors className={cn("w-3.5 h-3.5", isAbsent ? "text-orange-500" : "text-primary")} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-tight">{b.name}</p>
                        {isAbsent && (
                          <p className="text-[10px] text-orange-500 font-medium">Ausente hoje</p>
                        )}
                        {isLate && !isAbsent && (
                          <p className="text-[10px] text-yellow-600 font-medium">Com atraso</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{b.bookings}</p>
                      <p className="text-[10px] text-muted-foreground">agend. · <span className="text-primary font-semibold">R$ {b.revenue}</span></p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-border/50">
                    {isAbsent ? (
                      <button
                        onClick={() => restoreBarber(b.id)}
                        className="flex items-center gap-1 text-[10px] font-semibold text-available hover:opacity-80 transition-opacity"
                      >
                        <UserCheck className="w-3 h-3" />
                        Marcar como presente
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => markAbsent(b)}
                          className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-orange-600 transition-colors"
                        >
                          <UserX className="w-3 h-3" />
                          Ausente
                        </button>
                        <span className="text-border">·</span>
                        {isLate ? (
                          <button
                            onClick={() => setLateBarbers((prev) => { const s = new Set(prev); s.delete(b.id); return s; })}
                            className="flex items-center gap-1 text-[10px] font-medium text-yellow-600 hover:opacity-70 transition-opacity"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Chegou
                          </button>
                        ) : (
                          <button
                            onClick={() => markLate(b)}
                            className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-yellow-600 transition-colors"
                          >
                            <Timer className="w-3 h-3" />
                            Atraso
                          </button>
                        )}
                      </>
                    )}
                    {affected > 0 && (
                      <>
                        <span className="text-border">·</span>
                        <span className="text-[10px] text-orange-500 font-medium ml-auto">
                          {affected} pendente{affected > 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Agenda do dia ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Agenda do dia</p>
            <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
              {(["todos", "confirmado", "concluido", "reagendamento", "nao_compareceu", "cancelado"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "text-[10px] font-medium px-2 py-1 rounded-sm transition-colors",
                    statusFilter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f === "todos" ? "Todos" : STATUS_CONFIG[f].label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-md overflow-hidden">
            {/* Cabeçalho */}
            <div className="hidden sm:grid grid-cols-[80px_1fr_1fr_1fr_60px_110px_80px] gap-3 px-4 py-2.5 border-b border-border bg-muted/30">
              {["Horário", "Cliente", "Barbeiro", "Serviço", "Valor", "Status", "Ação"].map((h) => (
                <p key={h} className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{h}</p>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Nenhum agendamento encontrado</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((b) => {
                  const barberAbsent = absentBarbers.has(b.barberId);
                  const barberLate   = lateBarbers.has(b.barberId);
                  return (
                    <div
                      key={b.id}
                      className={cn(
                        "grid grid-cols-1 sm:grid-cols-[80px_1fr_1fr_1fr_60px_110px_80px] gap-1 sm:gap-3 px-4 py-3 items-center",
                        b.status === "concluido"      && "opacity-55",
                        b.status === "cancelado"      && "opacity-40",
                        b.status === "reagendamento"  && "bg-orange-50/60",
                        b.status === "nao_compareceu" && "bg-gray-50/60",
                      )}
                    >
                      <div>
                        <p className="font-mono text-xs font-bold text-foreground">{b.slot}</p>
                        {barberLate && b.status === "confirmado" && (
                          <p className="text-[9px] text-yellow-600 font-medium mt-0.5">Atraso</p>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{b.clientName}</p>
                      <div>
                        <p className="text-sm text-muted-foreground truncate">{b.barberName}</p>
                        {barberAbsent && (
                          <p className="text-[9px] text-orange-500 font-medium">Ausente</p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{b.serviceName}</p>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          R$ {b.status === "nao_compareceu" ? Math.round(b.servicePrice * 0.5) : b.servicePrice}
                        </p>
                        {b.status === "nao_compareceu" && (
                          <p className="text-[9px] text-muted-foreground font-medium">taxa 50%</p>
                        )}
                      </div>
                      <span className={cn(
                        "inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-sm border w-fit",
                        STATUS_CONFIG[b.status].className
                      )}>
                        {STATUS_CONFIG[b.status].label}
                      </span>

                      {/* Ação por linha */}
                      <div>
                        {b.status === "confirmado" && (
                          <button
                            onClick={() => markNoShow(b.id, b.clientName, b.servicePrice)}
                            className="text-[10px] font-medium text-muted-foreground hover:text-unavailable transition-colors whitespace-nowrap"
                          >
                            Não compareceu
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                <p className="text-xs text-muted-foreground">{filtered.length} agendamento{filtered.length !== 1 ? "s" : ""}</p>
                <p className="text-sm font-bold text-primary">
                  R$ {filtered.reduce((s, b) => {
                    if (b.status === "cancelado" || b.status === "reagendamento") return s;
                    if (b.status === "nao_compareceu") return s + Math.round(b.servicePrice * 0.5);
                    return s + b.servicePrice;
                  }, 0)},00
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Serviços mais pedidos ── */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Serviços mais pedidos este mês</p>
          <div className="bg-card border border-border rounded-md divide-y divide-border overflow-hidden">
            {[
              { name: "Degradê",               count: 18, pct: 100 },
              { name: "Corte Clássico",        count: 14, pct: 78  },
              { name: "Combo (Corte + Barba)", count: 10, pct: 56  },
              { name: "Barba",                 count: 7,  pct: 39  },
              { name: "Hidratação Capilar",    count: 3,  pct: 17  },
            ].map((svc, i) => (
              <div key={svc.name} className="flex items-center gap-4 px-4 py-3">
                <span className="text-[11px] font-bold text-muted-foreground/40 w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground truncate">{svc.name}</p>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      {i === 0 && <Star className="w-3 h-3 text-primary fill-primary" />}
                      <p className="text-xs font-semibold text-muted-foreground">{svc.count}×</p>
                    </div>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${svc.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── Modal de confirmação ── */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirm(null)} />
          <div className="relative bg-card border border-border rounded-md shadow-xl w-full max-w-sm p-5">
            <button
              onClick={() => setConfirm(null)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-md bg-orange-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm leading-tight">{confirm.title}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{confirm.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirm(null)}>
                Cancelar
              </Button>
              <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-0"
                onClick={() => { confirm.onConfirm(); setConfirm(null); }}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MetricCard ──────────────────────────────────────────────────────────────

const MetricCard = ({
  icon, label, value, sub, highlight = false,
}: {
  icon: React.ReactNode; label: string; value: string; sub: string; highlight?: boolean;
}) => (
  <div className={cn("rounded-md border p-4", highlight ? "bg-primary border-primary/80" : "bg-card border-border")}>
    <div className={cn("w-7 h-7 rounded-md flex items-center justify-center mb-3", highlight ? "bg-primary-foreground/15" : "bg-muted")}>
      <span className={highlight ? "text-primary-foreground" : "text-muted-foreground"}>{icon}</span>
    </div>
    <p className={cn("text-[11px] font-semibold uppercase tracking-wider mb-1", highlight ? "text-primary-foreground/70" : "text-muted-foreground")}>{label}</p>
    <p className={cn("text-2xl font-bold leading-tight", highlight ? "text-primary-foreground" : "text-foreground")}>{value}</p>
    <p className={cn("text-[11px] mt-1", highlight ? "text-primary-foreground/60" : "text-muted-foreground")}>{sub}</p>
  </div>
);

export default AdminPage;
