import HomePage from "@/components/shared/HomePage";
import Navbar from "@/components/shared/Navbar";

export default function Home() {
  return (
    <main className="flex flex-col py-6 md:w-[90%]  mx-auto gap-[56px] w-full px-6 items-center justify-between   ">
      <Navbar />
      <HomePage />
    </main>
  );
}
