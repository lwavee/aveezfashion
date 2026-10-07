import React from 'react';
import styles from './Radio.module.css';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  error,
  className = '',
  disabled = false,
}) => {
  return (
    <fieldset className={`${styles.fieldset} ${className}`}>
      {label && <legend className={styles.legend}>{label}</legend>}
      <div className={styles.optionsList}>
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          const isChecked = value !== undefined ? value === option.value : undefined;
          const isDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`${styles.radioContainer} ${isDisabled ? styles.disabled : ''}`}
            >
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={value !== undefined ? value === option.value : undefined}
                defaultChecked={value === undefined ? defaultValue === option.value : undefined}
                disabled={isDisabled}
                onChange={() => onChange && onChange(option.value)}
                className={styles.input}
              />
              <span className={styles.circle}>
                <span className={styles.dot} />
              </span>
              <div className={styles.labelContent}>
                <span className={styles.labelText}>{option.label}</span>
                {option.description && (
                  <span className={styles.descriptionText}>{option.description}</span>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && <span className={styles.errorText} role="alert">{error}</span>}
    </fieldset>
  );
};
