import * as React from 'react';
import { cn } from '@/lib/utils';

type ContainerProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
};

export function Container<T extends React.ElementType = 'div'>({
  as,
  className,
  children,
  ...rest
}: ContainerProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof ContainerProps<T>>) {
  const Component = (as ?? 'div') as React.ElementType;
  return (
    <Component className={cn('container-site', className)} {...rest}>
      {children}
    </Component>
  );
}
