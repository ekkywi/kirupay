"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

type DashboardSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type DashboardSelectProps = {
  options: DashboardSelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  variant?: "default" | "muted";
  withLeftIcon?: boolean;
  className?: string;
  contentClassName?: string;
  name?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function DashboardSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled = false,
  variant = "default",
  withLeftIcon = false,
  className,
  contentClassName,
  name,
}: DashboardSelectProps) {
  const fallbackValue = useMemo(() => {
    if (defaultValue) return defaultValue;
    if (options.length > 0) return options[0].value;
    return "";
  }, [defaultValue, options]);

  const [internalValue, setInternalValue] = useState(fallbackValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const triggerClass = variant === "muted" ? "dashboard-select-muted" : "dashboard-select";

  return (
    <>
      {name ? <input type="hidden" name={name} value={currentValue} /> : null}
      <Select.Root
        value={currentValue}
        onValueChange={(nextValue) => {
          if (!isControlled) {
            setInternalValue(nextValue);
          }
          onValueChange?.(nextValue);
        }}
        disabled={disabled}
      >
        <Select.Trigger
          className={cn(
            triggerClass,
            withLeftIcon && "dashboard-select-with-icon",
            "inline-flex items-center justify-between gap-2 !bg-none !pr-3",
            className,
          )}
          aria-label={placeholder || name || "Select option"}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            className={cn(
              "z-[220] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-blue-900/10 bg-white/95 shadow-xl shadow-blue-950/10 ring-1 ring-blue-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1028]/98 dark:shadow-black/40 dark:ring-cyan-400/10",
              contentClassName,
            )}
          >
            <Select.ScrollUpButton className="flex h-7 items-center justify-center text-slate-500 dark:text-slate-300">
              <ChevronUp className="h-4 w-4" />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm font-medium text-slate-700 outline-none transition-colors data-[highlighted]:bg-blue-50 data-[highlighted]:text-slate-900 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 dark:text-slate-200 dark:data-[highlighted]:bg-white/[0.08] dark:data-[highlighted]:text-white"
                >
                  <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </Select.ItemIndicator>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="flex h-7 items-center justify-center text-slate-500 dark:text-slate-300">
              <ChevronUp className="h-4 w-4 rotate-180" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </>
  );
}
