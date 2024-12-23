import SearchPage from "@/components/shared/SearcPage";
import React, { Suspense } from "react";

const WrappedSearchPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
};

export default WrappedSearchPage;
