import React from 'react';
import styles from './Section.module.css';
import { Container } from './Container';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'editorial';
  bg?: 'white' | 'off-white' | 'black' | 'surface' | 'transparent';
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  cleanContainer?: boolean;
  as?: React.ElementType;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  spacing = 'md',
  bg = 'white',
  containerSize = 'xl',
  cleanContainer = false,
  as: Component = 'section',
  children,
  className = '',
  ...props
}) => {
  const rootClass = [
    styles.section,
    styles[`spacing_${spacing}`],
    styles[`bg_${bg}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={rootClass} {...props}>
      <Container size={containerSize} clean={cleanContainer}>
        {children}
      </Container>
    </Component>
  );
};

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  action?: React.ReactNode;
  className?: string;
  inverted?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  action,
  className = '',
  inverted = false,
}) => {
  const headingClass = [
    styles.headingWrapper,
    styles[`align_${align}`],
    inverted ? styles.inverted : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={headingClass}>
      <div className={styles.headingContent}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.headingAction}>{action}</div>}
    </div>
  );
};
