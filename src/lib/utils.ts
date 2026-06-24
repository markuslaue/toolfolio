import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-Klassen sicher zusammenfuehren (shadcn-Standard). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
