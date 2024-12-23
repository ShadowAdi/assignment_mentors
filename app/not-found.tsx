import Link from "next/link";
import React from "react";

const NotFoundPage = () => {
  return (
    <main className="w-full flex h-screen justify-center flex-col items-center">
      <h2 className="text-3xl font-semibold">Maybe You are Lost</h2>

      <Link href={"/home"}>Home Page</Link>
    </main>
  );
};

export default NotFoundPage;
