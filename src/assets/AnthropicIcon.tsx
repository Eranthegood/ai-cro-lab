import { cn } from "@/lib/utils";

interface AnthropicIconProps {
  className?: string;
}

export const AnthropicIcon = ({ className }: AnthropicIconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4", className)}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L3 22h4.5l1.5-3.5h6l1.5 3.5H21L12 2zm0 5.5L15.25 15H8.75L12 7.5z"/>
    </svg>
  );
};