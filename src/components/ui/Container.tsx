import React from 'react';
import styles from './Container.module.css';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  clean?: boolean; // Removes horizontal padding if true
  as?: React.ElementType;
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  clean = false,
  as: Component = 'div',
  children,
  className = '',
  ...props
}) => {
  const rootClass = [
    styles.container,
    styles[size],
    clean ? styles.clean : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={rootClass} {...props}>
      {children}
    </Component>
  );
};
