import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className: string;
  classId: string;
  placeholder: string;
  textArea: string;
  type?: string; 
}

export const InputApp = ({
  className,
  classId,
  placeholder,
  textArea,
  type = "text",
  ...props
}: InputProps) => {
  return (
    <div className="space-y-6 text-left">
      <label htmlFor={classId} className="mb-2 block text-sm font-medium text-white-700">{textArea}</label>
      <input
        type={type}
        {...props} 
        className={className}
        id={classId}
        placeholder={placeholder}
      />
    </div>
  );
};