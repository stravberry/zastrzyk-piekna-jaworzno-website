
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Eye, 
  Edit, 
  Trash2,
  Search,
  TrendingUp,
  Clock,
  MoreHorizontal,
  FilePlus,
  EyeOff,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getAllBlogPostsForAdmin, togglePostPublication, deleteBlogPost } from "@/services/blog/blogPosts";
import { seedSamplePosts } from "@/services/blogService";
import { BlogPost } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const AdminPosts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const { 
    data: posts, 
    isLoading,
    refetch
  } = useQuery<BlogPost[]>({
    queryKey: ["adminBlogPosts"],
    queryFn: getAllBlogPostsForAdmin,
  });

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteBlogPost(deleteId);
        
        // Log admin activity
        await supabase.rpc('log_admin_activity', {
          _action: 'delete_blog_post',
          _resource_type: 'blog_post',
          _resource_id: deleteId.toString()
        });
        
        toast({
          title: "Post usunięty",
          description: "Post został pomyślnie usunięty",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć posta",
          variant: "destructive",
        });
      }
      setDeleteId(null);
    }
  };

  const handleTogglePublication = async (id: number, currentStatus: boolean) => {
    try {
      const success = await togglePostPublication(id, !currentStatus);
      if (success) {
        toast({
          title: currentStatus ? "Post ukryty" : "Post opublikowany",
          description: currentStatus 
            ? "Post nie będzie już widoczny dla odwiedzających" 
            : "Post jest teraz widoczny dla odwiedzających",
        });
        refetch();
      } else {
        throw new Error("Failed to toggle publication status");
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić statusu publikacji",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  const handleSeedSamplePosts = async () => {
    try {
      const success = await seedSamplePosts();
      if (success) {
        toast({
          title: "Przykładowe posty dodane",
          description: "Przykładowe posty zostały pomyślnie dodane",
        });
        refetch();
      } else {
        throw new Error("Failed to seed posts");
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać przykładowych postów",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const MobilePostCard = ({ post }: { post: BlogPost }) => (
    <Card className="mb-3 p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-md bg-cover bg-center"
            style={{ backgroundImage: `url(${post.image})` }}
          />
          <div className="flex flex-col">
            <span className="font-medium truncate max-w-[150px]">{post.title}</span>
            <span className="text-xs text-gray-500">{post.date}</span>
          </div>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/admin/posts/edit/${post.id}`} className="flex items-center cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleTogglePublication(post.id, post.isPublished || false)}
              >
                {post.isPublished ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Ukryj
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Opublikuj
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => confirmDelete(post.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Usuń
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex items-center text-xs space-x-4 text-gray-500">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          post.isPublished 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {post.isPublished ? 'Opublikowany' : 'Szkic'}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-pink-100 text-pink-800">
          {post.category}
        </span>
        <div className="flex items-center">
          <Eye className="h-3 w-3 mr-1" />
          <span>{post.stats?.views || 0}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>{post.readTime}</span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Szukaj postów..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/posts/new">
            <FilePlus className="mr-2" />
            Nowy post
          </Link>
        </Button>
      </div>
      
      {/* Mobile View */}
      {isMobile && (
        <div>
          {isLoading ? (
            <div className="text-center py-8">Ładowanie postów...</div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <MobilePostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Brak postów</p>
              <Button onClick={handleSeedSamplePosts} variant="outline" size="sm">
                Dodaj przykładowe posty
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Desktop View */}
      {!isMobile && (
        <Card>
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">ID</TableHead>
                  <TableHead>Tytuł</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Kategoria</TableHead>
                  <TableHead className="hidden lg:table-cell">Data</TableHead>
                  <TableHead className="text-center">Statystyki</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Ładowanie postów...
                    </TableCell>
                  </TableRow>
                ) : filteredPosts && filteredPosts.length > 0 ? (
                  filteredPosts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-md bg-cover bg-center hidden sm:block" 
                            style={{ backgroundImage: `url(${post.image})` }}
                          />
                          <div className="truncate max-w-[200px] lg:max-w-sm">
                            {post.title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          post.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.isPublished ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Opublikowany
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Szkic
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800">
                          {post.category}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{post.date}</TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-4">
                          <div className="flex items-center text-sm">
                            <Eye className="h-3 w-3 mr-1" /> 
                            <span>{post.stats?.views || 0}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <TrendingUp className="h-3 w-3 mr-1" /> 
                            <span>{post.stats?.clicks || 0}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-3 w-3 mr-1" /> 
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={post.isPublished 
                              ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
                              : "text-green-600 hover:text-green-700 hover:bg-green-50"
                            }
                            onClick={() => handleTogglePublication(post.id, post.isPublished || false)}
                          >
                            {post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">{post.isPublished ? 'Ukryj' : 'Opublikuj'}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            asChild
                          >
                            <Link to={`/admin/posts/edit/${post.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edytuj</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => confirmDelete(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Usuń</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div>
                        <p className="text-gray-500 mb-4">Brak postów</p>
                        <Button onClick={handleSeedSamplePosts} variant="outline" size="sm">
                          Dodaj przykładowe posty
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
      
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten post?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja nie może zostać cofnięta. Post zostanie permanentnie
              usunięty z serwera.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPosts;
