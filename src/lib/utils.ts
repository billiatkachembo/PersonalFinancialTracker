import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useToast } from "@/hooks/use-toast";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
