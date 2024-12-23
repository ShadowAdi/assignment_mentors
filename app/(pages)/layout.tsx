import Navbar from "@/components/shared/Navbar";
import React, { ReactNode } from "react";

const PageLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex flex-col py-6 md:w-[90%]  mx-auto gap-[56px] w-full px-6 items-center justify-between   ">
      <Navbar />
      {children}
    </main>
  );
};

export default PageLayout;
