import React, { createContext, useContext, useState, ReactNode } from "react";
import { Booking } from "@/data/mockData";

interface ReservationContextType {
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  cancelBooking: (id: string) => void;
}

const ReservationContext = createContext<ReservationContextType | null>(null);

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const addBooking = (b: Booking) => {
    setBookings((prev) => [...prev, b]);
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <ReservationContext.Provider value={{ bookings, addBooking, cancelBooking }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservations = () => {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error("useReservations must be used within ReservationProvider");
  return ctx;
};
