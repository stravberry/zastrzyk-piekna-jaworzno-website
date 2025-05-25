
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="media">Eksplorator mediów</TabsTrigger>
          <TabsTrigger value="categories">Kategorie</TabsTrigger>
        </TabsList>
        
        <TabsContent value="media" className="space-y-6">
          <MediaExplorer />
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          <GalleryCategories />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminGallery;
