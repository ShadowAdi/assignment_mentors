import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex flex-col gap-4 w-[90%]   mx-auto py-4 min-h-screen items-center justify-start">
      {children}
    </main>
  );
};

export default layout;
