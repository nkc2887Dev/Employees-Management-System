import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  pattern?: string;
  title?: string;
  min?: string | number;
  step?: string | number;
  accept?: string;
  placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  readOnly = false,
  pattern,
  title,
  min,
  step,
  accept,
  placeholder,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1 relative">
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          pattern={pattern}
          title={title}
          min={min}
          step={step}
          accept={accept}
          placeholder={placeholder}
          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
            disabled || readOnly ? 'bg-gray-100' : ''
          } ${error ? 'border-red-300 ring-red-500' : ''} ${
            type === 'date' ? 'cursor-pointer' : ''
          }`}
        />
        {type === 'date' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
