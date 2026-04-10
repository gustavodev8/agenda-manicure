import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReservationProvider } from "@/contexts/ReservationContext";
import Home from "./pages/Home";
import BookingPage from "./pages/BookingPage";
import MyReservations from "./pages/MyReservations";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ReservationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/barbeiros/:id" element={<BookingPage />} />
            <Route path="/meus-agendamentos" element={<MyReservations />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ReservationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
