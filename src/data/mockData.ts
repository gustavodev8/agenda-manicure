export interface Barber {
  id: string;
  name: string;
  description: string;
  image: string;
  available: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export interface Booking {
  id: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  slot: string;
  clientName: string;
}

export interface TimeSlot {
  label: string;
  start: string;
  end: string;
}

export const barbeiros: Barber[] = [
  {
    id: "b1",
    name: "Carlos Silva",
    description: "Especialista em cortes clássicos e degradê. Mais de 10 anos de experiência com técnicas tradicionais e modernas.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop&crop=face",
    available: true,
  },
  {
    id: "b2",
    name: "Rafael Mendes",
    description: "Expert em cortes modernos, pigmentação e tratamentos capilares. Referência em estilos urbanos.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face",
    available: true,
  },
  {
    id: "b3",
    name: "Diego Santos",
    description: "Mestre em navalhação e modelagem de barba. Atendimento VIP com produtos premium importados.",
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=300&fit=crop&crop=face",
    available: true,
  },
  {
    id: "b4",
    name: "Lucas Ferreira",
    description: "Especialista em cabelos cacheados e crespos. Técnicas exclusivas de hidratação e finalização.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&crop=face",
    available: true,
  },
];

export const servicos: Service[] = [
  {
    id: "s1",
    name: "Corte Clássico",
    description: "Corte tradicional com tesoura e máquina, acabamento perfeito com navalha.",
    price: 35,
    durationMinutes: 30,
  },
  {
    id: "s2",
    name: "Barba",
    description: "Aparação, modelagem e hidratação de barba com navalha e produtos premium.",
    price: 25,
    durationMinutes: 30,
  },
  {
    id: "s3",
    name: "Combo (Corte + Barba)",
    description: "Serviço completo de corte e barba com acabamento profissional.",
    price: 55,
    durationMinutes: 60,
  },
  {
    id: "s4",
    name: "Degradê",
    description: "Corte em degradê com transição suave, finalizado com gel ou pomada.",
    price: 40,
    durationMinutes: 30,
  },
  {
    id: "s5",
    name: "Hidratação Capilar",
    description: "Tratamento profundo com máscara hidratante e finalização com secador.",
    price: 30,
    durationMinutes: 30,
  },
];

export const timeSlots: TimeSlot[] = [
  // Manhã
  { label: "09:00 – 09:30", start: "09:00", end: "09:30" },
  { label: "09:30 – 10:00", start: "09:30", end: "10:00" },
  { label: "10:00 – 10:30", start: "10:00", end: "10:30" },
  { label: "10:30 – 11:00", start: "10:30", end: "11:00" },
  { label: "11:00 – 11:30", start: "11:00", end: "11:30" },
  { label: "11:30 – 12:00", start: "11:30", end: "12:00" },
  // Tarde
  { label: "14:00 – 14:30", start: "14:00", end: "14:30" },
  { label: "14:30 – 15:00", start: "14:30", end: "15:00" },
  { label: "15:00 – 15:30", start: "15:00", end: "15:30" },
  { label: "15:30 – 16:00", start: "15:30", end: "16:00" },
  { label: "16:00 – 16:30", start: "16:00", end: "16:30" },
  { label: "16:30 – 17:00", start: "16:30", end: "17:00" },
  { label: "17:00 – 17:30", start: "17:00", end: "17:30" },
  { label: "17:30 – 18:00", start: "17:30", end: "18:00" },
];
