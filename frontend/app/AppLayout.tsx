import React from "react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default AppLayout;
