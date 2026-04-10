import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = false, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1 w-full", className)}
      classNames={{
        months: "flex flex-col",
        month: "w-full",

        // Cabeçalho: mês e ano
        caption: "flex justify-center items-center relative mb-4",
        caption_label: "text-sm font-semibold text-foreground tracking-wide capitalize",

        // Botões de navegação
        nav: "flex items-center gap-1",
        nav_button: cn(
          "h-8 w-8 rounded-md flex items-center justify-center",
          "text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        ),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",

        // Tabela
        table: "w-full border-collapse",

        // Linha de cabeçalho (dom, seg, ...)
        head_row: "flex w-full mb-1",
        head_cell:
          "flex-1 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 py-1",

        // Linhas de dias
        row: "flex w-full mb-1",

        // Célula
        cell: cn(
          "flex-1 text-center relative p-0",
          "[&:has([aria-selected])]:bg-transparent",
        ),

        // Dia genérico
        day: cn(
          "mx-auto h-9 w-9 rounded-md text-sm font-medium transition-all",
          "flex items-center justify-center",
          "hover:bg-muted/60 hover:text-foreground",
          "aria-selected:opacity-100 cursor-pointer"
        ),

        // Dia selecionado
        day_selected: cn(
          "bg-primary text-primary-foreground font-bold",
          "hover:bg-primary hover:text-primary-foreground",
          "focus:bg-primary focus:text-primary-foreground",
          "shadow-md shadow-primary/30 scale-105"
        ),

        // Hoje (não selecionado)
        day_today: "font-bold text-primary underline underline-offset-2 decoration-primary/40",

        // Dias fora do mês
        day_outside: "text-muted-foreground/20 cursor-default",

        // Dias desabilitados (passados, domingos)
        day_disabled: "text-muted-foreground/20 cursor-not-allowed hover:bg-transparent",

        day_range_end: "day-range-end",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
