import React, { useState, forwardRef } from "react";

import styles from "./input.module.scss";

const Input = forwardRef(({ error, noMargin, ...props }, ref) => {
  const [focus, setFocus] = useState(false);
  
  return (
    <input
      className={styles.container}
      style={{
        borderColor: error && "red",
        backgroundColor: focus && "white",
        margin: noMargin && 0,
      }}
      ref={ref}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      {...props}
    />
  );
});

Input.displayName = 'Input';
export default Input;
