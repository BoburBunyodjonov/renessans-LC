'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { useTranslations } from 'next-intl';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Undo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Tiptap editor. The HTML it produces is sanitized on the server before it is
 * written to the database (see `lib/sanitize.ts`).
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const t = useTranslations('admin');
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener' } }),
      Placeholder.configure({ placeholder: placeholder ?? t('editor.placeholder') }),
    ],
    content: value || '',
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class:
          'legal-copy min-h-40 max-w-none px-4 py-3 text-admin-text outline-none [&_p]:my-2 [&_h2]:mt-4 [&_h3]:mt-3',
      },
    },
  });

  // Switching locale tabs swaps the document under the same editor instance.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || '';
    if (current === incoming || (current === '<p></p>' && incoming === '')) return;
    editor.commands.setContent(incoming, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="h-48 animate-pulse rounded-sm border border-admin-border bg-admin-panel" />
    );
  }

  const buttons = [
    {
      icon: Bold,
      label: t('editor.bold'),
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold'),
    },
    {
      icon: Italic,
      label: t('editor.italic'),
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic'),
    },
    {
      icon: Heading2,
      label: t('editor.heading2'),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive('heading', { level: 2 }),
    },
    {
      icon: Heading3,
      label: t('editor.heading3'),
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive('heading', { level: 3 }),
    },
    {
      icon: List,
      label: t('editor.bulletList'),
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      label: t('editor.orderedList'),
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive('orderedList'),
    },
    {
      icon: Link2,
      label: t('editor.link'),
      action: () => {
        const previous = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt(t('editor.linkPrompt'), previous ?? 'https://');
        if (url === null) return;
        if (url === '') {
          editor.chain().focus().extendMarkRange('link').unsetLink().run();
          return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      },
      active: editor.isActive('link'),
    },
    {
      icon: Undo2,
      label: t('editor.undo'),
      action: () => editor.chain().focus().undo().run(),
      active: false,
    },
    {
      icon: Redo2,
      label: t('editor.redo'),
      action: () => editor.chain().focus().redo().run(),
      active: false,
    },
  ];

  return (
    <div
      className={cn(
        'overflow-hidden rounded-sm border border-admin-border bg-admin-panel',
        className,
      )}
    >
      <div className="flex flex-wrap gap-0.5 border-b border-admin-border bg-admin-hover/50 p-1.5">
        {buttons.map(({ icon: Icon, label, action, active }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={action}
            className={cn(
              'grid size-8 place-items-center rounded-md transition-colors',
              active
                ? 'bg-brand-600 text-white'
                : 'text-admin-muted hover:bg-admin-hover hover:text-admin-text',
            )}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
