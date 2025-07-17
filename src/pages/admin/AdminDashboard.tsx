
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileText, Eye, Clock, Info, Plus, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getBlogStats } from "@/services/blogService";

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ["blogStats"],
    queryFn: getBlogStats,
  });

  // Refetch on component mount to ensure we get the latest data
  useEffect(() => {
    refetch();
  }, [refetch]);

  const StatCard = ({ title, value, icon, description }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode;
    description?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );

  if (error) {
    console.error('Dashboard error:', error);
    return (
      <div>
        <Alert variant="destructive" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Wystąpił problem podczas ładowania statystyk. Spróbuj odświeżyć stronę.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()}>Spróbuj ponownie</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Szybkie akcje</h2>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/admin/appointments/new">
              <Plus className="w-4 h-4 mr-2" />
              Umów wizytę
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/crm">
              <Calendar className="w-4 h-4 mr-2" />
              Przejdź do CRM
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-md" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Wszystkie wpisy" 
              value={stats.totalPosts} 
              icon={<FileText className="h-5 w-5" />}
              description="Łączna liczba wpisów na blogu"
            />
            <StatCard 
              title="Łączne wyświetlenia" 
              value={stats.totalViews.toLocaleString()} 
              icon={<Eye className="h-5 w-5" />}
              description="Suma wyświetleń wszystkich wpisów"
            />
            <StatCard 
              title="Średni czas czytania" 
              value={`${Math.round((stats.totalViews / stats.totalPosts) / 60) || 0} min`} 
              icon={<Clock className="h-5 w-5" />}
              description="Średni czas spędzony na wpisie"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Popularne kategorie</CardTitle>
                <CardDescription>Najczęściej używane kategorie na blogu</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.popularCategories && stats.popularCategories.length > 0 ? (
                  stats.popularCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{category.category}</span>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-2">{category.count} wpisów</span>
                        <div className="w-24 h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div 
                            className="h-full bg-pink-500" 
                            style={{ 
                              width: `${(category.count / stats.totalPosts) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Brak danych kategorii</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Ostatnie wpisy</CardTitle>
                <CardDescription>Najnowsze opublikowane artykuły</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentPosts && stats.recentPosts.length > 0 ? (
                    stats.recentPosts.map(post => (
                      <div key={post.id} className="flex items-start space-x-3">
                        <div 
                          className="w-12 h-12 rounded-md bg-cover bg-center flex-shrink-0" 
                          style={{ backgroundImage: `url(${post.image || '/placeholder.svg'})` }}
                        />
                        <div>
                          <Link 
                            to={`/admin/posts/edit/${post.id}`} 
                            className="text-sm font-medium hover:underline line-clamp-1"
                          >
                            {post.title}
                          </Link>
                          <div className="flex space-x-3 text-xs text-muted-foreground mt-1">
                            <span>{post.date}</span>
                            <span>{post.category}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Brak ostatnich wpisów</p>
                  )}
                </div>
                
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full mt-4 text-pink-500 border-pink-200"
                >
                  <Link to="/admin/posts">Zobacz wszystkie wpisy</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p>Nie udało się załadować statystyk</p>
          <Button onClick={() => refetch()} className="mt-4">Spróbuj ponownie</Button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
