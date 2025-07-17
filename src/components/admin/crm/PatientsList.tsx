
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PatientForm from "./PatientForm";
import EnhancedPatientCard from "./EnhancedPatientCard";

type Patient = Tables<"patients">;

interface PatientsListProps {
  searchTerm: string;
  onPatientSelect: (patient: Patient) => void;
  selectedPatient: Patient | null;
  onPatientUpdate?: () => void;
}

const PATIENTS_PER_PAGE = 10;

const PatientsList: React.FC<PatientsListProps> = ({ 
  searchTerm, 
  onPatientSelect, 
  selectedPatient,
  onPatientUpdate
}) => {
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const { data: patientsData, isLoading, refetch } = useQuery({
    queryKey: ['patients', searchTerm, currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * PATIENTS_PER_PAGE;
      const to = from + PATIENTS_PER_PAGE - 1;

      if (searchTerm.trim()) {
        const { data, error, count } = await supabase.rpc('search_patients', {
          search_term: searchTerm
        });
        
        if (error) throw error;
        
        // Manual pagination for search results since RPC doesn't support range
        const paginatedData = data?.slice(from, from + PATIENTS_PER_PAGE) || [];
        
        return {
          patients: paginatedData,
          totalCount: data?.length || 0
        };
      } else {
        const { data, error, count } = await supabase
          .from('patients')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);
        
        if (error) throw error;
        
        return {
          patients: data || [],
          totalCount: count || 0
        };
      }
    }
  });

  const patients = patientsData?.patients || [];
  const totalCount = patientsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PATIENTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePatientSuccess = () => {
    // Invalidate and refetch patients data
    queryClient.invalidateQueries({ queryKey: ['patients'] });
    queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
    refetch();
    setShowAddPatient(false);
    toast.success('Pacjent został dodany');
    
    // Notify parent component
    if (onPatientUpdate) {
      onPatientUpdate();
    }
  };

  const handlePatientEdit = (patient: Patient) => {
    // Navigate to patient profile page
    navigate(`/admin/crm/patient/${patient.id}`);
  };

  const handlePatientView = (patient: Patient) => {
    // Navigate to patient profile page
    navigate(`/admin/crm/patient/${patient.id}`);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(page);
            }}
            isActive={currentPage === page}
            className="text-xs sm:text-sm"
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (isLoading) {
    return <div className="text-center py-4 text-sm">Ładowanie pacjentów...</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">
            Znaleziono {totalCount} pacjentów
          </h3>
          {totalPages > 1 && (
            <p className="text-xs sm:text-sm text-gray-500">
              Strona {currentPage} z {totalPages} (pokazuje {patients.length} z {totalCount})
            </p>
          )}
        </div>
        <Button 
          onClick={() => setShowAddPatient(true)}
          size="sm"
          className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Dodaj pacjenta
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {patients.map((patient) => (
          <EnhancedPatientCard
            key={patient.id}
            patient={patient}
            isSelected={selectedPatient?.id === patient.id}
            onSelect={handlePatientView}
            onEdit={handlePatientEdit}
          />
        ))}

        {patients.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            {searchTerm ? 'Nie znaleziono pacjentów' : 'Brak pacjentów w systemie'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent className="flex-wrap gap-1">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={`${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''} text-xs sm:text-sm`}
                />
              </PaginationItem>
              
              {renderPaginationItems()}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={`${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''} text-xs sm:text-sm`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {showAddPatient && (
        <PatientForm 
          isOpen={showAddPatient}
          onClose={() => setShowAddPatient(false)}
          onSuccess={handlePatientSuccess}
        />
      )}
    </div>
  );
};

export default PatientsList;
