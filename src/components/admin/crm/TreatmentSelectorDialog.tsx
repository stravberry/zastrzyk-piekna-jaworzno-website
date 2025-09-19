import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Treatment {
  id: string;
  name: string;
  price?: number;
  duration_minutes?: number;
  description?: string;
}

interface TreatmentSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  treatments: Record<string, Treatment[]>;
  onSelect: (treatmentId: string) => void;
  selectedTreatmentId?: string;
}

export const TreatmentSelectorDialog: React.FC<TreatmentSelectorDialogProps> = ({
  isOpen,
  onClose,
  treatments,
  onSelect,
  selectedTreatmentId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and search treatments
  const filteredTreatments = useMemo(() => {
    if (!searchQuery.trim()) return treatments;

    const filtered: Record<string, Treatment[]> = {};
    Object.entries(treatments).forEach(([category, categoryTreatments]) => {
      const matchingTreatments = categoryTreatments.filter(treatment =>
        treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingTreatments.length > 0) {
        filtered[category] = matchingTreatments;
      }
    });
    return filtered;
  }, [treatments, searchQuery]);

  const handleTreatmentSelect = (treatmentId: string) => {
    onSelect(treatmentId);
    onClose();
    setSearchQuery(""); // Reset search when closing
  };

  const handleClose = () => {
    onClose();
    setSearchQuery(""); // Reset search when closing
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[90vh] max-h-[800px] p-0 gap-0">
        {/* Header with search */}
        <DialogHeader className="p-4 pb-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Wybierz zabieg</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          
          {/* Search bar */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj zabiegów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
              autoFocus
            />
          </div>
        </DialogHeader>

        {/* Treatment list */}
        <div className="flex-1 overflow-y-auto p-4 pt-3">
          {Object.keys(filteredTreatments).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Nie znaleziono zabiegów" : "Brak dostępnych zabiegów"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(filteredTreatments).map(([category, categoryTreatments]) => (
                <div key={category} className="space-y-3">
                  {/* Category header */}
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground/80 uppercase tracking-wide">
                      {category}
                    </h3>
                    <div className="flex-1 h-px bg-border" />
                    <Badge variant="secondary" className="text-xs">
                      {categoryTreatments.length}
                    </Badge>
                  </div>

                  {/* Treatment cards */}
                  <div className="grid gap-2">
                    {categoryTreatments.map((treatment) => (
                      <button
                        key={treatment.id}
                        onClick={() => handleTreatmentSelect(treatment.id)}
                        className={`
                          group relative w-full p-4 rounded-lg border text-left 
                          transition-all duration-200 hover:shadow-md hover:border-primary/30
                          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                          ${selectedTreatmentId === treatment.id 
                            ? 'bg-primary/5 border-primary shadow-sm' 
                            : 'bg-card hover:bg-muted/50'
                          }
                        `}
                        style={{ minHeight: '48px' }} // Ensure minimum touch target
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
                              {treatment.name}
                            </h4>
                            
                            {treatment.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {treatment.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-3 text-xs">
                              {treatment.price && (
                                <span className="font-medium text-primary">
                                  {treatment.price} zł
                                </span>
                              )}
                              {treatment.duration_minutes && (
                                <span className="text-muted-foreground">
                                  {treatment.duration_minutes} min
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {selectedTreatmentId === treatment.id && (
                            <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};