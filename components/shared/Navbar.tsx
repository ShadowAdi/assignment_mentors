"use client";
import { useContextHook } from "@/context/UserContext";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathName = usePathname();
  const { authenticated, user, setUser, setIsAuthenticated } = useContextHook();
  return (
    <nav className="flex   justify-between items-center  w-full">
      <Link href={"/"}>
      <h1 className="text-primary dark:text-primary-foreground text-4xl font-bold">
        Alpha
      </h1>
      </Link>

      {!authenticated ? (
        <div className="flex gap-4 items-center">
          <Link href={"/login"}>
            {" "}
            <Button className="px-12 py-6 rounded-full" variant={"default"}>
              <span className="text-lg font-semibold ">Mentor</span>
            </Button>
          </Link>
          <Link href={"/login"}>
            {" "}
            <Button className="px-12 py-6 rounded-full bg-slate-100 hover:bg-slate-200 text-black ">
              <span className="text-lg font-semibold ">Mentee</span>
            </Button>
          </Link>{" "}
        </div>
      ) : (
        <div className="flex gap-7 items-center mr-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="px-12 py-6 rounded-full" variant={"default"}>
                <span className="text-lg font-semibold">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className="font-bold text-lg">
                Hi, {user?.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href={"/profile"}>
                <DropdownMenuItem
                  className={`cursor-pointer rounded ${
                    pathName.includes("/profile") && "underline"
                  } `}
                >
                  <span> Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href={"/home"}>
                <DropdownMenuItem
                  className={`cursor-pointer rounded ${
                    pathName.includes("/home") && "underline"
                  } `}
                >
                  <span> Home</span>
                </DropdownMenuItem>
              </Link>

              <Link href={"/profile/update"}>
                <DropdownMenuItem
                  className={`cursor-pointer rounded ${
                    pathName.includes("/profile/update") && "underline"
                  } `}
                >
                  <span>Update</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className={`cursor-pointer rounded  `}
                onClick={() => {
                  localStorage.removeItem("token");
                  setIsAuthenticated(false);
                  setUser(null);
                  window.location.href = "/login";
                }}
              >
                <span> Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
