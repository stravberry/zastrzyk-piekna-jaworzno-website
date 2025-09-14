import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mail, Eye, CheckCircle, Users } from "lucide-react";
import { ContactSubmission } from "@/services/contactService";

interface ContactsHeaderProps {
  submissions: ContactSubmission[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const ContactsHeader: React.FC<ContactsHeaderProps> = ({
  submissions,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}) => {
  const getStats = () => {
    return {
      total: submissions.length,
      new: submissions.filter(s => s.status === 'new').length,
      reviewed: submissions.filter(s => s.status === 'reviewed').length,
      responded: submissions.filter(s => s.status === 'responded').length,
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Łącznie</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Mail className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nowe</p>
                <p className="text-2xl font-bold">{stats.new}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Przejrzane</p>
                <p className="text-2xl font-bold">{stats.reviewed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Odpowiedziane</p>
                <p className="text-2xl font-bold">{stats.responded}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po imieniu, emailu lub temacie..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtruj po statusie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="w-2 h-2 p-0 rounded-full" />
                    Nowe
                  </div>
                </SelectItem>
                <SelectItem value="reviewed">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="w-2 h-2 p-0 rounded-full" />
                    Przejrzane
                  </div>
                </SelectItem>
                <SelectItem value="responded">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full" />
                    Odpowiedziane
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};