import React from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  error,
  className = '',
  id,
  disabled,
  checked,
  ...props
}) => {
  const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);

  return (
    <div className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className}`}>
      <label htmlFor={checkboxId} className={styles.container}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className={styles.input}
          aria-invalid={Boolean(error)}
          {...props}
        />
        <span className={`${styles.box} ${error ? styles.errorBox : ''}`}>
          <svg className={styles.checkIcon} viewBox="0 0 12 10" fill="none">
            <polyline points="1.5 5 4.5 8 10.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className={styles.labelContent}>
          <span className={styles.labelText}>{label}</span>
          {description && <span className={styles.descriptionText}>{description}</span>}
        </div>
      </label>
      {error && <span className={styles.errorText} role="alert">{error}</span>}
    </div>
  );
};
