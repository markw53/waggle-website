import * as React from "react";

export const FormField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-foreground">{label}</label>
    {children}
  </div>
);
