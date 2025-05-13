import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to format time in seconds to MM:SS
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Function to format large numbers with commas
export function formatNumber(num: number | undefined | null): string {
    if (num === undefined || num === null || isNaN(num)) {
        return '0';
    }
    return num.toLocaleString();
}

// Function to format dates consistently across server and client
export function formatDate(date: string | Date): string {
    if (!date) return 'Unknown';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Use a fixed format that doesn't depend on locale
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
}
