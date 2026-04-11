import { useNavigate } from "react-router-dom";
import { CalendarRange, Users, Building2, BookOpen, UsersRound, AlertTriangle, CheckCircle2, Sparkles, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useSchedule } from "@/contexts/ScheduleContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    professors, rooms, subjects, classGroups,
    entries, conflictReport, lastGenResult,
    runGenerate,
  } = useSchedule();

  // Metrics
  const totalSessions = classGroups.reduce(
    (acc, cg) => acc + cg.subjectIds.reduce((a, sid) => {
      const s = subjects.find(x => x.id === sid);
      return a + (s?.sessionsPerWeek ?? 0);
    }, 0),
    0,
  );
  const scheduledPct = totalSessions > 0
    ? Math.round((entries.length / totalSessions) * 100)
    : 0;

  const pendingGroups = classGroups.filter(cg =>
    cg.subjectIds.some(sid =>
      !entries.some(e => e.classGroupId === cg.id && e.subjectId === sid)
    )
  ).length;

  const stats = [
    { label: "Turmas cadastradas",    value: classGroups.length,  icon: UsersRound,  color: "text-indigo-500", path: "/turmas"      },
    { label: "Professores",           value: professors.length,   icon: Users,       color: "text-violet-500", path: "/professores" },
    { label: "Disciplinas",           value: subjects.length,     icon: BookOpen,    color: "text-sky-500",    path: "/disciplinas" },
    { label: "Salas disponíveis",     value: rooms.length,        icon: Building2,   color: "text-emerald-500",path: "/salas"       },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">SmartSchedule Uni</h1>
            <p className="text-muted-foreground mt-0.5">Sistema de Escalonamento Acadêmico</p>
          </div>
          <Button
            onClick={() => { runGenerate(); navigate("/grade"); }}
            className="gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Gerar Grade Horária
          </Button>
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

        {/* Schedule status */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Generation status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-primary" />
                Status da Grade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma grade gerada ainda. Clique em <strong>Gerar Grade Horária</strong> para começar.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Aulas alocadas</span>
                    <span className="font-semibold">{entries.length} / {totalSessions}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${scheduledPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{scheduledPct}% das sessões alocadas</p>

                  {conflictReport.hasConflicts ? (
                    <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{conflictReport.conflicts.length} conflito(s) detectado(s)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Sem conflitos</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Turmas com Pendências
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingGroups === 0 && entries.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Todas as turmas estão com horários completos!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.length === 0 && (
                    <p className="text-sm text-muted-foreground">Gere a grade para ver o status das turmas.</p>
                  )}
                  {classGroups.map(cg => {
                    const cgEntries = entries.filter(e => e.classGroupId === cg.id);
                    const needed = cg.subjectIds.reduce((a, sid) => {
                      const s = subjects.find(x => x.id === sid);
                      return a + (s?.sessionsPerWeek ?? 0);
                    }, 0);
                    const done = cgEntries.length;
                    if (entries.length === 0 || done >= needed) return null;
                    return (
                      <div key={cg.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cg.name}</span>
                        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                          {done}/{needed} sessões
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Last gen unscheduled */}
        {lastGenResult && lastGenResult.unscheduled.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-4 h-4" />
                Disciplinas Não Alocadas ({lastGenResult.unscheduled.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-amber-800">
                {lastGenResult.unscheduled.map((u, i) => {
                  const cg = classGroups.find(x => x.id === u.classGroupId);
                  const sub = subjects.find(x => x.id === u.subjectId);
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <span className="shrink-0">•</span>
                      <span>
                        <strong>{cg?.name}</strong> — {sub?.name}:{" "}
                        <span className="text-amber-700">{u.reason}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Ver Grade",       icon: CalendarRange, path: "/grade",       color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
              { label: "Professores",     icon: Users,         path: "/professores", color: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
              { label: "Salas",           icon: Building2,     path: "/salas",       color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
              { label: "Disciplinas",     icon: BookOpen,      path: "/disciplinas", color: "bg-sky-50 text-sky-700 hover:bg-sky-100" },
              { label: "Turmas",          icon: UsersRound,    path: "/turmas",      color: "bg-rose-50 text-rose-700 hover:bg-rose-100" },
            ].map(({ label, icon: Icon, path, color }) => (
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
