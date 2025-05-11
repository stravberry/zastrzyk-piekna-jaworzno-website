
import React from "react";
import { Image } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FormValues } from "./formSchema";

interface EditorPreviewTabProps {
  previewData: FormValues | null;
}

export const EditorPreviewTab: React.FC<EditorPreviewTabProps> = ({ previewData }) => {
  if (!previewData) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Image className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">No preview available</h3>
        <p>Fill in the form fields and click "Preview" to see how your post will look</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="prose max-w-none">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-4 break-words">{previewData.title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-gray-500 text-xs mb-6">
                <span>{new Date().toLocaleDateString()}</span>
                <span className="inline">•</span>
                <span>{previewData.category}</span>
                <span className="inline">•</span>
                <span>{previewData.readTime} read</span>
              </div>
              <p className="text-lg text-gray-600 break-words">{previewData.excerpt}</p>
            </div>
            
            {previewData.image && (
              <div className="mb-6">
                <img 
                  src={previewData.image} 
                  alt={previewData.title} 
                  className="w-full max-h-[200px] sm:max-h-[400px] object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/800x400?text=Image+Error";
                  }}
                />
              </div>
            )}
            
            <div 
              className="whitespace-pre-wrap break-words text-sm sm:text-base" 
              dangerouslySetInnerHTML={{ __html: previewData.content.replace(/\n/g, '<br/>') }} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
