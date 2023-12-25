import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import "./cardstyle.css";

type SkeletonSectionProps = {
  index: number;
};

const SkeletonSection: React.FC<SkeletonSectionProps> = ({ index }) => (
  <div className="cardWidth bg-[#27272a] rounded-[16px] skeleton py-3" style={{ cursor: "pointer" }}>
    {index === 0 && (
      <Skeleton className="mb-2" style={{ width: "100%" }} />
    )}
    <div className="flex flex-col gap-3 py-4 pb-4 px-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Skeleton className="rounded-full w-[24px] h-[24px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        {index === 0 && (
          <Skeleton className="text-[#FF7539] h-4 w-12" />
        )}
      </div>
      <div className="flex gap-2 pb-3 items-center justify-between border-b border-zinc-700">
        <Skeleton className="w-16" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex gap-2 items-center">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonSection;