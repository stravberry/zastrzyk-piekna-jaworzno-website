
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Phone, Mail, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";
import PatientForm from "./PatientForm";

type Patient = Tables<"patients">;

interface PatientsListProps {
  searchTerm: string;
  onPatientSelect: (patient: Patient) => void;
  selectedPatient: Patient | null;
}

const PATIENTS_PER_PAGE = 10;

const PatientsList: React.FC<PatientsListProps> = ({ 
  searchTerm, 
  onPatientSelect, 
  selectedPatient 
}) => {
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (isLoading) {
    return <div className="text-center py-4">Ładowanie pacjentów...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            Znaleziono {totalCount} pacjentów
          </h3>
          {totalPages > 1 && (
            <p className="text-sm text-gray-500">
              Strona {currentPage} z {totalPages} (pokazuje {patients.length} z {totalCount})
            </p>
          )}
        </div>
        <Button 
          onClick={() => setShowAddPatient(true)}
          size="sm"
          className="bg-pink-500 hover:bg-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Dodaj pacjenta
        </Button>
      </div>

      <div className="grid gap-4">
        {patients.map((patient) => (
          <Card 
            key={patient.id} 
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedPatient?.id === patient.id ? 'ring-2 ring-pink-500' : ''
            }`}
            onClick={() => onPatientSelect(patient)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">
                    {patient.first_name} {patient.last_name}
                  </h4>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patient.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-3 h-3 mr-1" />
                        {patient.phone}
                      </div>
                    )}
                    
                    {patient.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-3 h-3 mr-1" />
                        {patient.email}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    {patient.skin_type && (
                      <Badge variant="secondary">
                        Skóra: {patient.skin_type}
                      </Badge>
                    )}
                    
                    {patient.source && (
                      <Badge variant="outline">
                        Źródło: {patient.source}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(patient.created_at!)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {patients.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Nie znaleziono pacjentów' : 'Brak pacjentów w systemie'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
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
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
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
          onSuccess={() => {
            refetch();
            setShowAddPatient(false);
            toast.success('Pacjent został dodany');
          }}
        />
      )}
    </div>
  );
};

export default PatientsList;
