import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Placeholder } from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { EditorToolbar } from './EditorToolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing your blog post...",
  className,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2',
        },
      }),
      Color,
      TextStyle,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-border w-full',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-border',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted/50 p-2 text-left font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base max-w-none focus:outline-none',
          'min-h-[200px] sm:min-h-[300px] p-3 sm:p-4',
          className
        ),
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input rounded-md focus-within:ring-1 focus-within:ring-ring">
      <div className="sticky top-0 z-10 bg-background">
        <EditorToolbar editor={editor} />
      </div>
      <EditorContent 
        editor={editor} 
        className="prose-editor"
      />
      <style>{`
        .prose-editor .ProseMirror {
          outline: none;
        }
        
        .prose-editor .ProseMirror.is-editor-empty:first-child::before {
          color: hsl(var(--muted-foreground));
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        .prose-editor .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 1.5rem 0 1rem 0;
        }
        
        .prose-editor .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.3;
          margin: 1.25rem 0 0.75rem 0;
        }
        
        .prose-editor .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1rem 0 0.5rem 0;
        }
        
        .prose-editor .ProseMirror h4 {
          font-size: 1.1rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1rem 0 0.5rem 0;
        }
        
        .prose-editor .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.6;
        }
        
        .prose-editor .ProseMirror ul,
        .prose-editor .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        
        .prose-editor .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        .prose-editor .ProseMirror blockquote {
          border-left: 4px solid hsl(var(--border));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          background: hsl(var(--muted) / 0.3);
          padding: 1rem;
          border-radius: 0.375rem;
        }
        
        .prose-editor .ProseMirror code {
          background: hsl(var(--muted));
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.85em;
        }
        
        .prose-editor .ProseMirror pre {
          background: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .prose-editor .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        
        .prose-editor .ProseMirror hr {
          margin: 2rem 0;
          border: none;
          border-top: 2px solid hsl(var(--border));
        }
        
        .prose-editor .ProseMirror table {
          margin: 1rem 0;
        }
        
        .prose-editor .ProseMirror img {
          margin: 1rem auto;
          display: block;
        }
        
        .prose-editor .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        
        .prose-editor .ProseMirror strong {
          font-weight: 700;
        }
        
        .prose-editor .ProseMirror em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};