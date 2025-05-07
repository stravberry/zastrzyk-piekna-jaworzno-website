import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileText, Eye, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { getBlogStats } from "@/services/blogService";

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["blogStats"],
    queryFn: getBlogStats,
  });

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

  return (
    <AdminProtectedRoute>
      <AdminLayout title="Dashboard">
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
                title="Total Posts" 
                value={stats.totalPosts} 
                icon={<FileText className="h-5 w-5" />}
                description="Total number of blog posts"
              />
              <StatCard 
                title="Total Views" 
                value={stats.totalViews} 
                icon={<Eye className="h-5 w-5" />}
                description="Combined views across all posts"
              />
              <StatCard 
                title="Average Reading Time" 
                value={`${Math.round(stats.totalViews / stats.totalPosts)} min`} 
                icon={<Clock className="h-5 w-5" />}
                description="Average time spent on blog posts"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Popular Categories</CardTitle>
                  <CardDescription>Most used categories across all blog posts</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.popularCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{category.category}</span>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-2">{category.count} posts</span>
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
                  ))}
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                  <CardDescription>Latest published blog posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentPosts.map(post => (
                      <div key={post.id} className="flex items-start space-x-3">
                        <div 
                          className="w-12 h-12 rounded-md bg-cover bg-center flex-shrink-0" 
                          style={{ backgroundImage: `url(${post.image})` }}
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
                    ))}
                  </div>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full mt-4 text-pink-500 border-pink-200"
                  >
                    <Link to="/admin/posts">View All Posts</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <p>Failed to load statistics</p>
        )}
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminDashboard;
