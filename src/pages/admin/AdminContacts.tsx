
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ContactsHeader } from "@/components/admin/contacts/ContactsHeader";
import { ContactCard } from "@/components/admin/contacts/ContactCard";
import ContactReplyDialog from "@/components/admin/crm/ContactReplyDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { getContactSubmissions, updateContactStatus, type ContactSubmission } from "@/services/contactService";

const AdminContacts = () => {
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: submissions = [], isLoading, error } = useQuery({
    queryKey: ["contact-submissions"],
    queryFn: getContactSubmissions
  });

  const handleStatusUpdate = async (id: string, status: 'reviewed' | 'responded') => {
    try {
      await updateContactStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
      toast.success(`Status został zmieniony na: ${status === 'reviewed' ? 'przejrzana' : 'odpowiedziana'}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error("Błąd podczas aktualizacji statusu");
    }
  };

  const handleReply = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsReplyDialogOpen(true);
  };

  const handleReplyDialogClose = () => {
    setIsReplyDialogOpen(false);
    setSelectedSubmission(null);
  };

  const handleReplySent = () => {
    queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
    if (selectedSubmission) {
      handleStatusUpdate(selectedSubmission.id, 'responded');
    }
  };

  // Filter submissions based on search term and status
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = searchTerm === "" || 
      submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort submissions: new first, then by date
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    if (a.status === 'new' && b.status !== 'new') return -1;
    if (a.status !== 'new' && b.status === 'new') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-64 text-center">
          <div className="space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h2 className="text-xl font-semibold">Błąd ładowania wiadomości</h2>
              <p className="text-muted-foreground">
                Wystąpił błąd podczas pobierania wiadomości kontaktowych.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-4 sm:py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Wiadomości kontaktowe</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj wiadomościami z formularza kontaktowego i odpowiadaj klientom
          </p>
        </div>

        {/* Statistics and Filters */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-20 rounded-lg" />
          </div>
        ) : (
          <ContactsHeader
            submissions={submissions}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        )}

        {/* Contact Submissions List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : sortedSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {searchTerm || statusFilter !== "all" 
                      ? "Brak wyników" 
                      : "Brak wiadomości kontaktowych"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "Spróbuj zmienić kryteria wyszukiwania lub filtry."
                      : "Gdy ktoś wyśle wiadomość przez formularz kontaktowy, pojawi się tutaj."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSubmissions.map((submission) => (
                <ContactCard
                  key={submission.id}
                  submission={submission}
                  onStatusUpdate={handleStatusUpdate}
                  onReply={handleReply}
                />
              ))}
            </div>
          )}
        </div>

        {/* Reply Dialog */}
        {selectedSubmission && (
          <ContactReplyDialog
            isOpen={isReplyDialogOpen}
            onClose={handleReplyDialogClose}
            submission={selectedSubmission}
            onReplySent={handleReplySent}
          />
        )}
      </div>
    );
};

export default AdminContacts;
