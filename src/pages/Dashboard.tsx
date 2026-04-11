import { useNavigate } from "react-router-dom";
import {
  CalendarRange, Users, Building2, BookOpen, UsersRound,
  AlertTriangle, CheckCircle2, ChevronRight, Circle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useSchedule } from "@/contexts/ScheduleContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { professors, rooms, subjects, classGroups, entries, conflictReport } = useSchedule();

  const stats = [
    { label: "Turmas",       value: classGroups.length, icon: UsersRound,  color: "text-indigo-500",  path: "/turmas"      },
    { label: "Professores",  value: professors.length,  icon: Users,       color: "text-violet-500",  path: "/professores" },
    { label: "Disciplinas",  value: subjects.length,    icon: BookOpen,    color: "text-sky-500",     path: "/disciplinas" },
    { label: "Salas",        value: rooms.length,       icon: Building2,   color: "text-emerald-500", path: "/salas"       },
  ];

  const quickLinks = [
    { label: "Grade Horária", icon: CalendarRange, path: "/grade",       color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"   },
    { label: "Professores",   icon: Users,         path: "/professores", color: "bg-violet-50 text-violet-700 hover:bg-violet-100"   },
    { label: "Salas",         icon: Building2,     path: "/salas",       color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
    { label: "Disciplinas",   icon: BookOpen,      path: "/disciplinas", color: "bg-sky-50 text-sky-700 hover:bg-sky-100"            },
    { label: "Turmas",        icon: UsersRound,    path: "/turmas",      color: "bg-rose-50 text-rose-700 hover:bg-rose-100"         },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div>
          <h1 className="text-2xl font-bold">SmartSchedule Uni</h1>
          <p className="text-muted-foreground mt-0.5">Sistema de Organização de Horários Acadêmicos</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, path }) => (
            <Card
              key={label}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(path)}
            >
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                  </div>
                  <Icon className={`w-5 h-5 mt-1 ${color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Grade status */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-primary" />
                Status da Grade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Aulas na grade</span>
                <span className="font-semibold">{entries.length}</span>
              </div>

              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Acesse a <strong>Grade Horária</strong> e clique em qualquer célula para adicionar aulas manualmente.
                </p>
              ) : conflictReport.hasConflicts ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{conflictReport.conflicts.length} conflito(s) detectado(s)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Sem conflitos na grade</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Class group overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <UsersRound className="w-4 h-4 text-primary" />
                Turmas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {classGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma turma cadastrada ainda.</p>
              ) : (
                <div className="space-y-2">
                  {classGroups.map(cg => {
                    const cgEntries = entries.filter(e => e.classGroupId === cg.id);
                    return (
                      <div key={cg.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5">
                          <Circle className="w-2 h-2 fill-primary text-primary" />
                          <span className="font-medium">{cg.name}</span>
                        </span>
                        <Badge variant="secondary">{cgEntries.length} aula(s)</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickLinks.map(({ label, icon: Icon, path, color }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${color}`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
