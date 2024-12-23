"use client";
import SearchPage from "@/components/shared/SearcPage";
import { UserRole } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const WrappedSearchPage = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("searchQuery") || "";
  const skillsFilter: number[] = searchParams.get("skillsFilter")
    ? searchParams.get("skillsFilter")!.split(",").map(Number)
    : [];
  const interestsFilter: number[] = searchParams.get("interestsFilter")
    ? searchParams.get("interestsFilter")!.split(",").map(Number)
    : [];
  const roleParam = searchParams.get("role") || "";
  const role: UserRole | undefined =
    roleParam === UserRole.MENTOR || roleParam === UserRole.MENTEE
      ? (roleParam as UserRole)
      : undefined;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage
        searchQuery={searchQuery}
        skillsFilter={skillsFilter}
        interestsFilter={interestsFilter}
        role={role}
      />
    </Suspense>
  );
};

export default WrappedSearchPage;
