'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import type { LeadFormCourse } from '@/components/shared/lead-form';
import type { LeadSourceKey } from '@/types/lead';

type OpenOptions = {
  source?: LeadSourceKey;
  courseId?: string;
  title?: string;
  description?: string;
  /** Runs after the lead is accepted — used by the material download gate. */
  onSuccess?: () => void;
};

type LeadModalContextValue = {
  open: (options?: OpenOptions) => void;
  close: () => void;
};

const LeadModalContext = createContext<LeadModalContextValue | null>(null);

/** Opens the lead modal from any client component. */
export function useLeadModal(): LeadModalContextValue {
  const context = useContext(LeadModalContext);
  if (!context) throw new Error('useLeadModal must be used inside <LeadModalProvider>');
  return context;
}

const LeadModalDialog = dynamic(() => import('@/components/shared/lead-modal-dialog'), {
  ssr: false,
});

export function LeadModalProvider({
  courses,
  children,
}: {
  courses: LeadFormCourse[];
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Stays true after the first open so the dialog keeps its mounted state.
  const [mounted, setMounted] = useState(false);
  const [options, setOptions] = useState<OpenOptions>({});

  const open = useCallback((next: OpenOptions = {}) => {
    setOptions(next);
    setMounted(true);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <LeadModalContext.Provider value={value}>
      {children}
      {mounted ? (
        <LeadModalDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          courses={courses}
          source={options.source ?? 'OTHER'}
          courseId={options.courseId}
          title={options.title}
          description={options.description}
          onSuccess={options.onSuccess}
        />
      ) : null}
    </LeadModalContext.Provider>
  );
}
