
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star } from "lucide-react";

export type BadgeType = "promotion" | "new";

interface ServiceBadgeProps {
  badge: BadgeType;
  size?: "sm" | "md" | "lg";
}

const ServiceBadge: React.FC<ServiceBadgeProps> = ({ badge, size = "md" }) => {
  const getBadgeConfig = (badge: BadgeType) => {
    switch (badge) {
      case "promotion":
        return {
          text: "PROMOCJA",
          className: "bg-pink-500 text-white hover:bg-pink-600",
          icon: <Sparkles className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
        };
      case "new":
        return {
          text: "NOWOŚĆ",
          className: "bg-green-500 text-white hover:bg-green-600",
          icon: <Star className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig(badge);
  if (!config) return null;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-2.5 py-1"
  };

  return (
    <Badge className={`${config.className} ${sizeClasses[size]} font-bold inline-flex items-center`}>
      {config.icon}
      {config.text}
    </Badge>
  );
};

export default ServiceBadge;
