// src/components/client/FAQ/SearchBar.tsx
"use client";

import { useState } from "react";

export function SearchBar({ onSearch }) {
  const [value, setValue] = useState("");

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onSearch(e.target.value);
      }}
    />
  );
}
