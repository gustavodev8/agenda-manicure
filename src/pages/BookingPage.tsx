import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { barbeiros, servicos, timeSlots } from "@/data/mockData";
import { useReservations } from "@/contexts/ReservationContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  User,
  CreditCard,
  Scissors,
  Smartphone,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const morningSlots = timeSlots.slice(0, 6);
const afternoonSlots = timeSlots.slice(6);

const steps = [
  { number: 1, label: "Data & Horário" },
  { number: 2, label: "Serviço" },
  { number: 3, label: "Pagamento" },
];

type PaymentMethod = "pix" | "credito" | "debito";

const paymentOptions: { key: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { key: "pix", label: "Pix", icon: <Smartphone className="w-4 h-4" /> },
  { key: "credito", label: "Crédito", icon: <CreditCard className="w-4 h-4" /> },
  { key: "debito", label: "Débito", icon: <CreditCard className="w-4 h-4" /> },
];

const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bookings, addBooking } = useReservations();

  const barber = barbeiros.find((b) => b.id === id);

  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedService = servicos.find((s) => s.id === selectedServiceId);

  const occupiedSlots = useMemo(() => {
    if (!date || !barber) return new Set<string>();
    const dateStr = format(date, "yyyy-MM-dd");
    return new Set(
      bookings
        .filter((b) => b.barberId === barber.id && b.date === dateStr)
        .map((b) => b.slot)
    );
  }, [date, barber, bookings]);

  const handleConfirm = () => {
    if (!barber || !date || !selectedSlot || !selectedService || !clientName.trim()) return;
    addBooking({
      id: `b-${Date.now()}`,
      barberId: barber.id,
      barberName: barber.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      date: format(date, "yyyy-MM-dd"),
      slot: selectedSlot,
      clientName: clientName.trim(),
    });
    setShowSuccess(true);
  };

  if (!barber) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="text-center mt-12 text-muted-foreground">Barbeiro não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <Header />
      <main className="max-w-xl mx-auto px-4 py-6">

        {/* Voltar */}
        <button
          onClick={() => (step === 1 ? navigate("/") : setStep((s) => s - 1))}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? "Trocar barbeiro" : "Voltar"}
        </button>

        {/* Card do barbeiro */}
        <div className="flex items-center gap-3 bg-card border border-border rounded-md px-4 py-3 mb-6">
          <img
            src={barber.image}
            alt={barber.name}
            className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-primary/20"
          />
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight">{barber.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{barber.description}</p>
          </div>
          <span className="ml-auto text-[10px] font-medium text-muted-foreground shrink-0">
            Etapa {step} de {steps.length}
          </span>
        </div>

        {/* ── Step indicator ── */}
        <div className="mb-8">
          <div className="relative flex items-start justify-between">
            {/* Trilha de fundo */}
            <div className="absolute top-4 left-4 right-4 h-px bg-border" />
            {/* Trilha de progresso */}
            <div
              className="absolute top-4 left-4 h-px bg-primary transition-all duration-500 ease-out"
              style={{ width: `calc((100% - 2rem) * ${(step - 1) / (steps.length - 1)})` }}
            />
            {/* Círculos + Labels */}
            {steps.map((s) => (
              <div key={s.number} className="relative flex flex-col items-center gap-2 z-10">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300",
                    step > s.number && "bg-primary border-primary text-primary-foreground",
                    step === s.number && "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/30",
                    step < s.number && "bg-card border-border text-muted-foreground"
                  )}
                >
                  {step > s.number ? <Check className="w-3.5 h-3.5" /> : s.number}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium whitespace-nowrap",
                    step === s.number ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
            STEP 1 — Data & Horário
        ══════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-4">

            {/* Calendário */}
            <div className="bg-card border border-border rounded-md px-5 pt-5 pb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Data
              </p>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { setDate(d); setSelectedSlot(""); }}
                disabled={(d) => {
                  const day = d.getDay();
                  return d < new Date(new Date().setHours(0, 0, 0, 0)) || day === 0;
                }}
                locale={ptBR}
                className="pointer-events-auto"
              />
              {!date && (
                <p className="text-center text-xs text-muted-foreground/60 mt-1">
                  Domingos indisponíveis
                </p>
              )}
            </div>

            {/* Horários */}
            {date && (
              <div className="bg-card border border-border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Horário
                  </p>
                  {selectedSlot && (
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-sm">
                      <Clock className="w-3 h-3" />
                      {selectedSlot}
                    </span>
                  )}
                </div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 mb-2">
                  Manhã
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {morningSlots.map((slot) => {
                    const isOccupied = occupiedSlots.has(slot.label);
                    const isSelected = selectedSlot === slot.label;
                    return (
                      <button
                        key={slot.label}
                        disabled={isOccupied}
                        onClick={() => setSelectedSlot(slot.label)}
                        className={cn(
                          "font-mono text-sm py-3 px-3 rounded-sm border transition-all text-center",
                          isOccupied && "border-border/30 bg-muted/10 text-muted-foreground/25 cursor-not-allowed line-through",
                          !isOccupied && !isSelected && "border-border bg-card text-foreground hover:border-foreground/25 hover:bg-muted/30",
                          isSelected && "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                        )}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[9px] text-muted-foreground/40 font-semibold uppercase tracking-[0.2em]">
                    Intervalo 12:00 – 14:00
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 mb-2">
                  Tarde
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {afternoonSlots.map((slot) => {
                    const isOccupied = occupiedSlots.has(slot.label);
                    const isSelected = selectedSlot === slot.label;
                    return (
                      <button
                        key={slot.label}
                        disabled={isOccupied}
                        onClick={() => setSelectedSlot(slot.label)}
                        className={cn(
                          "font-mono text-sm py-3 px-3 rounded-sm border transition-all text-center",
                          isOccupied && "border-border/30 bg-muted/10 text-muted-foreground/25 cursor-not-allowed line-through",
                          !isOccupied && !isSelected && "border-border bg-card text-foreground hover:border-foreground/25 hover:bg-muted/30",
                          isSelected && "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                        )}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button onClick={() => setStep(2)} disabled={!date || !selectedSlot} className="w-full" size="lg">
              Próximo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 2 — Serviço
        ══════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Serviço
            </p>

            {servicos.map((svc) => {
              const isSelected = selectedServiceId === svc.id;
              return (
                <button
                  key={svc.id}
                  onClick={() => setSelectedServiceId(svc.id)}
                  className={cn(
                    "w-full text-left rounded-md border px-4 py-4 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-foreground/20 hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                      )}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm leading-tight">{svc.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{svc.description}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-sm font-bold shrink-0 transition-colors",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      R$ {svc.price},00
                    </span>
                  </div>
                </button>
              );
            })}

            <Button onClick={() => setStep(3)} disabled={!selectedServiceId} className="w-full" size="lg">
              Próximo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 3 — Dados & Pagamento
        ══════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-4">

            {/* Resumo */}
            <div className="bg-card border border-border rounded-md p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Resumo
              </p>
              <div className="space-y-2">
                {[
                  { label: "Barbeiro", value: barber.name },
                  { label: "Data", value: date ? format(date, "dd/MM/yyyy") : "" },
                  { label: "Horário", value: selectedSlot },
                  { label: "Serviço", value: selectedService?.name ?? "" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-border">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-base font-bold text-primary">
                    R$ {selectedService?.price},00
                  </span>
                </div>
              </div>
            </div>

            {/* Nome */}
            <div className="bg-card border border-border rounded-md p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Seus dados
              </p>
              <Label htmlFor="clientName" className="text-sm text-muted-foreground mb-1.5 block">
                Nome completo
              </Label>
              <Input
                id="clientName"
                placeholder="Ex: João da Silva"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            {/* Forma de pagamento */}
            <div className="bg-card border border-border rounded-md p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Forma de pagamento
              </p>
              <div className="grid grid-cols-3 gap-2">
                {paymentOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setPaymentMethod(opt.key)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3 rounded-md border text-xs font-medium transition-all",
                      paymentMethod === opt.key
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                O pagamento garante seu horário. Cancele com até 2h de antecedência para reembolso.
              </p>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={!clientName.trim()}
              className="w-full"
              size="lg"
            >
              Confirmar e Pagar · R$ {selectedService?.price},00
            </Button>
          </div>
        )}
      </main>

      {/* Modal de sucesso */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-available/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-9 h-9 text-available" />
            </div>
            <DialogTitle className="text-xl font-bold">Agendamento confirmado!</DialogTitle>
            <DialogDescription asChild>
              <div className="text-left w-full mt-4 space-y-2">
                {[
                  { label: "Cliente", value: clientName },
                  { label: "Barbeiro", value: barber.name },
                  { label: "Serviço", value: selectedService?.name ?? "" },
                  { label: "Data", value: date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "" },
                  { label: "Horário", value: selectedSlot },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 mt-1 border-t border-border">
                  <span className="text-sm font-semibold">Total pago</span>
                  <span className="text-base font-bold text-primary">
                    R$ {selectedService?.price},00
                  </span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => navigate("/")} className="w-full mt-2">
            Voltar ao início
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingPage;
