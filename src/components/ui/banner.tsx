import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BannerProps {
  message: string;
  dismissible?: boolean;
  variant?: "default" | "success" | "warning" | "destructive";
}

const Banner = ({ message, dismissible = true, variant = "default" }: BannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    success: "bg-green-600 text-white",
    warning: "bg-yellow-600 text-white", 
    destructive: "bg-destructive text-destructive-foreground"
  };

  return (
    <div className={`${variantStyles[variant]} px-4 py-2 text-sm flex items-center justify-center relative fixed top-0 left-0 right-0 z-50`}>
      <span className="font-medium">{message}</span>
      {dismissible && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 h-6 w-6 p-0 text-current hover:bg-white/20"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default Banner;