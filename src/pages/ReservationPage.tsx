import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { barbeiros, servicos, timeSlots, ReservableItem } from "@/data/mockData";
import { useReservations } from "@/contexts/ReservationContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Clock, Sun, Sunset, PackagePlus, Check } from "lucide-react";
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

interface ServiceSelection {
  id: string;
}

const ReservationPage = () => {
  const { category, id } = useParams<{ category: string; id: string }>();
  const navigate = useNavigate();
  const { addReservation, reservations } = useReservations();

  const allItems = category === "barbeiros" ? barbeiros : servicos;
  const item: ReservableItem | undefined = allItems.find((i) => i.id === id);
  const isServico = category === "servicos";

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedServicos, setSelectedServicos] = useState<ServiceSelection[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Quantidade já reservada por slot para o item atual
  const reservedQtyForSlot = useMemo(() => {
    if (!date || !item) return {} as Record<string, number>;
    const dateStr = format(date, "yyyy-MM-dd");
    const result: Record<string, number> = {};
    reservations
      .filter((r) => r.itemId === item.id && r.date === dateStr)
      .forEach((r) =>
        r.slots.forEach((s) => {
          result[s] = (result[s] ?? 0) + (r.quantity ?? 1);
        })
      );
    return result;
  }, [date, item, reservations]);

  const occupiedSlots = useMemo(() => {
    if (!date || !item) return new Set<string>();
    const occupied = new Set<string>();
    Object.entries(reservedQtyForSlot).forEach(([slot, qty]) => {
      if (!isServico || qty >= (item.totalUnits ?? 1)) {
        occupied.add(slot);
      }
    });
    return occupied;
  }, [reservedQtyForSlot, isServico, item, date]);

  const toggleSlot = (label: string) => {
    // Para barbeiros: seleção única (um horário por agendamento)
    if (!isServico) {
      setSelectedSlots((prev) => prev.includes(label) ? [] : [label]);
      return;
    }
    setSelectedSlots((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const toggleServico = (svcId: string) => {
    setSelectedServicos((prev) =>
      prev.some((s) => s.id === svcId)
        ? prev.filter((s) => s.id !== svcId)
        : [...prev, { id: svcId }]
    );
  };

  const handleConfirm = () => {
    if (!item || !date || selectedSlots.length === 0) return;
    const dateStr = format(date, "yyyy-MM-dd");
    const ts = Date.now();
    const groupId = !isServico && selectedServicos.length > 0 ? `g-${ts}` : undefined;

    addReservation({
      id: `r-${ts}`,
      groupId,
      itemId: item.id,
      itemName: item.name,
      date: dateStr,
      slots: selectedSlots,
      category: category as "barbeiros" | "servicos",
    });

    selectedServicos.forEach((sv, idx) => {
      const svc = servicos.find((s) => s.id === sv.id);
      if (!svc) return;
      addReservation({
        id: `r-${ts}-${idx}`,
        groupId,
        itemId: svc.id,
        itemName: svc.name,
        date: dateStr,
        slots: selectedSlots,
        category: "servicos",
      });
    });

    setShowSuccess(true);
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="text-center mt-12 text-muted-foreground">Item não encontrado.</p>
      </div>
    );
  }

  const canConfirm = !!date && selectedSlots.length > 0;

  const SlotButton = ({ slot }: { slot: typeof timeSlots[0] }) => {
    const isOccupied = occupiedSlots.has(slot.label);
    const isSelected = selectedSlots.includes(slot.label);
    const isDisabled = isOccupied;

    return (
      <button
        disabled={isDisabled}
        onClick={() => toggleSlot(slot.label)}
        className={cn(
          "relative font-mono text-xs py-3 px-2 rounded-lg border-2 transition-all duration-150 text-center font-medium",
          isOccupied && "bg-muted/50 text-muted-foreground border-border cursor-not-allowed",
          !isDisabled && !isSelected && "border-available/60 text-available bg-available/5 hover:bg-available/10 hover:border-available",
          isSelected && "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
        )}
      >
        <span className="block leading-tight">{slot.label}</span>
        {isOccupied && (
          <span className="block text-[9px] mt-0.5 opacity-60 font-sans font-normal">Ocupado</span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/${category}`)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* Item summary */}
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
          <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h1 className="text-xl font-bold text-foreground">{item.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          </div>
        </div>

        {/* Date picker */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <Label className="text-base font-semibold mb-4 block">Escolha a data</Label>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d);
                setSelectedSlots([]);
                setSelectedServicos([]);
              }}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              locale={ptBR}
              className="pointer-events-auto"
            />
          </div>
        </div>

        {/* Time slots */}
        {date && (
          <div className="bg-card border border-border rounded-lg p-5 mb-6">
            <div className="flex items-center justify-between mb-5">
              <Label className="text-base font-semibold">
                {isServico ? "Escolha o horário" : "Escolha o horário"}
              </Label>
              {selectedSlots.length > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  {selectedSlots.length} selecionado{selectedSlots.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {!isServico && (
              <p className="text-xs text-muted-foreground mb-4">
                Selecione um horário disponível para o agendamento.
              </p>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Sun className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manhã</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {morningSlots.map((slot) => <SlotButton key={slot.label} slot={slot} />)}
              </div>
            </div>

            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider px-1">Almoço · 12:00 – 14:00</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Sunset className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tarde</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {afternoonSlots.map((slot) => <SlotButton key={slot.label} slot={slot} />)}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded border-2 border-available bg-available/5" />
                <span className="text-[11px] text-muted-foreground">Disponível</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-[11px] text-muted-foreground">Selecionado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded border-2 border-border bg-muted/50" />
                <span className="text-[11px] text-muted-foreground">Ocupado</span>
              </div>
            </div>
          </div>
        )}

        {/* Serviços adicionais — apenas para barbeiros */}
        {!isServico && date && selectedSlots.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-5 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <PackagePlus className="w-4 h-4 text-primary" />
              <Label className="text-base font-semibold">Deseja adicionar algum serviço?</Label>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Selecione os serviços que deseja realizar no agendamento.
            </p>

            <div className="space-y-2">
              {servicos.map((svc) => {
                const isChecked = selectedServicos.some((s) => s.id === svc.id);

                return (
                  <div
                    key={svc.id}
                    onClick={() => toggleServico(svc.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-2 px-4 py-3 transition-all cursor-pointer",
                      !isChecked && "border-border hover:border-primary/40",
                      isChecked && "border-primary bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                      isChecked ? "bg-primary border-primary" : "border-muted-foreground/40"
                    )}>
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{svc.name}</p>
                      <p className="text-xs text-muted-foreground">{svc.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Sticky confirm bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-4 py-3 z-10">
        <div className="max-w-2xl mx-auto">
          {canConfirm && (
            <p className="text-xs text-muted-foreground text-center mb-2">
              {format(date!, "dd/MM/yyyy")} · {selectedSlots.join(", ")}
              {!isServico && selectedServicos.length > 0 && ` · ${selectedServicos.length} serviço${selectedServicos.length > 1 ? "s" : ""}`}
            </p>
          )}
          <Button onClick={handleConfirm} disabled={!canConfirm} className="w-full" size="lg">
            Confirmar Agendamento
          </Button>
        </div>
      </div>

      {/* Success modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-available mb-2" />
            <DialogTitle className="text-xl">Agendamento confirmado!</DialogTitle>
            <DialogDescription className="text-left space-y-1 mt-3 w-full">
              <span className="block"><strong>{isServico ? "Serviço" : "Barbeiro"}:</strong> {item.name}</span>
              <span className="block"><strong>Data:</strong> {date ? format(date, "dd/MM/yyyy") : ""}</span>
              <span className="block"><strong>Horário:</strong> {selectedSlots.join(", ")}</span>
              {!isServico && selectedServicos.length > 0 && (
                <div className="pt-1 mt-1 border-t border-border">
                  <p className="font-semibold mb-1">Serviços:</p>
                  {selectedServicos.map((sv) => {
                    const svc = servicos.find((s) => s.id === sv.id);
                    return svc ? (
                      <span key={sv.id} className="block text-sm">{svc.name}</span>
                    ) : null;
                  })}
                </div>
              )}
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

export default ReservationPage;
