
import React from "react";
import { Control } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { FormValues } from "./formSchema";
import { ContentFields } from "./ContentFields";
import { ImageUploader } from "./ImageUploader";
import { MetadataFields } from "./MetadataFields";

interface EditorMainTabProps {
  control: Control<FormValues>;
}

export const EditorMainTab: React.FC<EditorMainTabProps> = ({ control }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <ContentFields control={control} />
            <ImageUploader control={control} />
            <MetadataFields control={control} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
