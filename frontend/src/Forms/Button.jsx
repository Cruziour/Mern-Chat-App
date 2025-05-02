import React, { forwardRef, useId } from "react";

const Button = (
  {
    btnName = "Submit",
    btnClass = "w-full bg-indigo-600 mt-4 h-8 text-lg rounded-xl",
    ...props
  },
  ref
) => {
  const id = useId();
  return (
    <div className="px-4">
      <button className={btnClass} {...props} ref={ref} id={id}>
        {btnName}
      </button>
    </div>
  );
};

export default forwardRef(Button);
