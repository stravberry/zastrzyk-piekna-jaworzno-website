import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Settings } from "lucide-react";

interface PngQualitySelectorProps {
  onExport: (quality: 'web' | 'print' | 'social' | 'instagram') => void;
  isFullExport?: boolean;
}

const PngQualitySelector: React.FC<PngQualitySelectorProps> = ({
  onExport,
  isFullExport = false,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          PNG
          <Settings className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Jakość eksportu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onExport('web')}>
          <div className="flex flex-col">
            <span className="font-medium">Web (szybki)</span>
            <span className="text-xs text-muted-foreground">
              Standardowa jakość, szybkie ładowanie
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onExport('print')}>
          <div className="flex flex-col">
            <span className="font-medium">Druk (wysoka jakość)</span>
            <span className="text-xs text-muted-foreground">
              Wysoka rozdzielczość, idealne do druku
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onExport('social')}>
          <div className="flex flex-col">
            <span className="font-medium">Social Media</span>
            <span className="text-xs text-muted-foreground">
              Zoptymalizowane dla mediów społecznościowych
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onExport('instagram')}>
          <div className="flex flex-col">
            <span className="font-medium">Instagram Stories</span>
            <span className="text-xs text-muted-foreground">
              Pionowy format 9:16 (1080x1920px)
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PngQualitySelector;