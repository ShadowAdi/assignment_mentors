"use client";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useContextHook } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const HomePage = () => {
  const { authenticated } = useContextHook();

  return (
    <section className="w-full gap-5 mt-52 px-5 py-6  flex flex-col items-center justify-center ">
      <h1 className="text-5xl font-bold    ">
        A Platform To Meet
        <span className="font-bold text-primary cursor-pointer mx-4 italic">
          Mentors
        </span>
        and
        <span className="font-bold text-primary cursor-pointer mx-3 italic">
          Mentees
        </span>
      </h1>
      <p className="w-[40%] text-center mx-auto text-wrap">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel doloribus
        obcaecati, repellendus nobis ipsa libero nostrum. A eum ipsa eaque.
      </p>
      {!authenticated ? (
        <div className="flex items-center gap-6 ">
          <Link href={"/login"}>
            {" "}
            <Button className="px-12 py-6 rounded-full" variant={"default"}>
              <span className="text-xl tracking-[1px]  font-semibold ">
                Mentor
              </span>
            </Button>
          </Link>
          <Link href={"/login"}>
            {" "}
            <Button
              className="px-12 py-6 rounded-full bg-purple-600 hover:bg-purple-700
           text-white "
            >
              <span className="text-xl tracking-[1px] font-semibold ">
                Mentee
              </span>
            </Button>
          </Link>{" "}
        </div>
      ) : (
        <div className="flex items-center gap-6 ">
          <Link href={"/home"}>
            {" "}
            <Button className="px-12 py-6 rounded-full" variant={"default"}>
              <span className="text-xl tracking-[1px]  font-semibold ">
                Home
              </span>
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default HomePage;
