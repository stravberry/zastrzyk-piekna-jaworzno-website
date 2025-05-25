
import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GalleryCategories from "@/components/admin/gallery/GalleryCategories";
import GalleryImages from "@/components/admin/gallery/GalleryImages";
import ImageUpload from "@/components/admin/gallery/ImageUpload";

const AdminGallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <AdminLayout 
      title="Galeria" 
      subtitle="Zarządzanie zdjęciami i kategoriami galerii"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Prześlij zdjęcia</TabsTrigger>
          <TabsTrigger value="images">Zarządzaj zdjęciami</TabsTrigger>
          <TabsTrigger value="categories">Kategorie</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          <ImageUpload onUploadComplete={() => setActiveTab("images")} />
        </TabsContent>
        
        <TabsContent value="images" className="space-y-6">
          <GalleryImages />
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          <GalleryCategories />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminGallery;
