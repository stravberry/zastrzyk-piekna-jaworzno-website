
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TemplateRefreshButtonProps {
  onRefresh?: () => void;
}

const TemplateRefreshButton: React.FC<TemplateRefreshButtonProps> = ({ onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Szablony zostały odświeżone');
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error('Błąd podczas odświeżania szablonów');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      Odśwież szablony
    </Button>
  );
};

export default TemplateRefreshButton;
