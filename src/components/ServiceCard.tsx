
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const ServiceCard = ({ title, description, icon, link }: ServiceCardProps) => {
  // Jeśli tytuł to "Peelingi chemiczne", używamy nowego linku i tytułu
  const displayTitle = title === "Peelingi chemiczne" ? "POZOSTAŁE ZABIEGI" : title;
  const displayLink = title === "Peelingi chemiczne" ? "/cennik" : link;
  const linkText = title === "Peelingi chemiczne" ? "Zobacz cennik" : "Dowiedz się więcej";

  return (
    <Card className="group relative h-full overflow-hidden rounded-2xl border border-primary/10 bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30 hover:bg-card/90">
      {/* Glow border overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="pb-4">
        <div className="relative mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15 shadow-sm transition-all">
          {/* Halo behind icon */}
          <span aria-hidden className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />
          {/* Ikona */}
          <span className="relative [&_svg]:h-7 [&_svg]:w-7">{icon}</span>
        </div>
        <CardTitle className="font-playfair text-2xl transition-colors group-hover:text-primary">
          {displayTitle}
        </CardTitle>
        <span className="mt-3 block h-[2px] w-20 bg-gradient-to-r from-primary/40 to-transparent" aria-hidden="true" />
      </CardHeader>
      <CardContent className="flex h-full flex-col">
        <CardDescription className="text-base leading-relaxed text-muted-foreground">
          {description}
        </CardDescription>
        <div className="mt-4 flex items-end">
          <Button variant="ghost" className="px-0 text-primary hover:bg-primary/10" asChild>
            <Link to={displayLink} className="inline-flex items-center gap-1.5 group/cta story-link">
              {linkText}
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover/cta:translate-x-1.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
