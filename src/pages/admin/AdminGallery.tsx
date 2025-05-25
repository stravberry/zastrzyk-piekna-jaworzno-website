
import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GalleryCategories from "@/components/admin/gallery/GalleryCategories";
import MediaExplorer from "@/components/admin/gallery/MediaExplorer";

const AdminGallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState("media");

  return (
    <AdminLayout 
      title="Galeria" 
      subtitle="Zarządzanie mediami i kategoriami galerii"
    >
      <div className="px-2 sm:px-4 lg:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
            <TabsTrigger value="media" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Eksplorator mediów</span>
              <span className="sm:hidden">Media</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">
              Kategorie
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="media" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <MediaExplorer />
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <GalleryCategories />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminGallery;
