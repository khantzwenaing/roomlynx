
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  label: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  label,
  placeholder = "Select date",
  className,
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-between text-left font-normal h-14 text-lg border-2",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {date ? (
              <span className="font-medium">{format(date, "PPP")}</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <CalendarIcon className="h-5 w-5 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="rounded-md border-2 p-3 pointer-events-auto"
          classNames={{
            day_today: "bg-gray-100 text-gray-900 font-bold",
            day_selected: "bg-primary !text-primary-foreground font-bold",
            day: cn(
              "h-12 w-12 p-0 font-normal text-lg aria-selected:opacity-100"
            ),
            caption: "text-lg",
            caption_label: "text-lg font-semibold",
            nav_button: "h-10 w-10",
            table: "w-full border-collapse space-y-2",
            head_row: "flex w-full",
            head_cell: "text-base w-12 font-bold",
            row: "flex w-full",
            cell: "h-12 w-12 text-center text-lg relative p-0",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
