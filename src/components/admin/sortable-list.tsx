'use client';

import { useState, type ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { describeError } from '@/components/admin/form-shell';
import type { ActionResult } from '@/server/actions/helpers';
import { cn } from '@/lib/utils';

type SortableItem = { id: string };

/**
 * Drag-and-drop reordering. The new order is persisted in a single batch action
 * (PROMPT.md §14) and is keyboard-operable through dnd-kit's keyboard sensor.
 */
export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
  disabled = false,
}: {
  items: T[];
  onReorder: (orderedIds: string[]) => Promise<ActionResult<unknown>>;
  renderItem: (item: T, index: number) => ReactNode;
  disabled?: boolean;
}) {
  const [order, setOrder] = useState(items);
  const t = useTranslations('admin');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrder((current) => {
      const from = current.findIndex((item) => item.id === active.id);
      const to = current.findIndex((item) => item.id === over.id);
      return arrayMove(current, from, to);
    });
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const result = await onReorder(order.map((item) => item.id));
      if (result.ok) {
        toast.success(t('common.orderSaved'));
        setDirty(false);
      } else {
        toast.error(describeError(result.error, t));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {dirty ? (
        <div className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3">
          <p className="text-sm font-semibold text-admin-text">{t('common.orderChanged')}</p>
          <Button size="sm" onClick={save} disabled={saving} className="ms-auto">
            {saving ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {t('common.saveOrder')}
          </Button>
        </div>
      ) : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={order.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2">
            {order.map((item, index) => (
              <SortableRow
                key={item.id}
                id={item.id}
                disabled={disabled}
                label={t('common.reorderHandle')}
              >
                {renderItem(item, index)}
              </SortableRow>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableRow({
  id,
  disabled,
  label,
  children,
}: {
  id: string;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-admin-border bg-admin-panel p-3',
        isDragging && 'z-10 shadow-lg',
      )}
    >
      {!disabled ? (
        <button
          type="button"
          aria-label={label}
          className="cursor-grab touch-none text-admin-muted hover:text-admin-text active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" aria-hidden />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}
