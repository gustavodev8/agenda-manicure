import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScheduleProvider } from "@/contexts/ScheduleContext";
import Dashboard from "./pages/Dashboard";
import ProfessoresPage from "./pages/ProfessoresPage";
import SalasPage from "./pages/SalasPage";
import DisciplinasPage from "./pages/DisciplinasPage";
import TurmasPage from "./pages/TurmasPage";
import GradePage from "./pages/GradePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ScheduleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/professores"  element={<ProfessoresPage />} />
            <Route path="/salas"        element={<SalasPage />} />
            <Route path="/disciplinas"  element={<DisciplinasPage />} />
            <Route path="/turmas"       element={<TurmasPage />} />
            <Route path="/grade"        element={<GradePage />} />
            <Route path="*"             element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ScheduleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
