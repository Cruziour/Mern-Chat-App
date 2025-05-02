import React, { forwardRef, useId } from 'react';

const Input = (
  {
    label,
    type = 'text',
    labelClass = 'text-[1rem]',
    inputClass = 'w-full border rounded-md h-8 md:h-12 lg:h-8 mb-2 text-[1rem] px-3',
    name = '',
    ...props
  },
  ref
) => {
  const id = useId();
  return (
    <div className="px-4">
      {label && (
        <label className={`${labelClass}`} htmlFor={id} name={name}>
          {label}
        </label>
      )}
      {label && (<br />)}
      <input
        type={type}
        className={`${inputClass}`}
        id={id}
        name={name}
        ref={ref}
        {...props}
      />
    </div>
  );
};

export default forwardRef(Input);
