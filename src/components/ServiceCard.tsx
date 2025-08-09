
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
    <Card className="group relative h-full overflow-hidden rounded-xl border border-primary/10 bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30 hover:bg-card/90">
      <CardHeader className="pb-4">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15 shadow-sm transition-colors">
          {/* Ikona */}
          <span className="[&_svg]:h-7 [&_svg]:w-7">{icon}</span>
        </div>
        <CardTitle className="font-playfair text-2xl transition-colors group-hover:text-primary">
          {displayTitle}
        </CardTitle>
        <span className="mt-3 block h-px w-16 bg-primary/20" aria-hidden="true" />
      </CardHeader>
      <CardContent className="flex h-full flex-col">
        <CardDescription className="text-base text-muted-foreground">
          {description}
        </CardDescription>
        <div className="mt-4 flex items-end">
          <Button variant="ghost" className="px-0 text-primary hover:bg-primary/10" asChild>
            <Link to={displayLink} className="inline-flex items-center group/cta">
              {linkText}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
