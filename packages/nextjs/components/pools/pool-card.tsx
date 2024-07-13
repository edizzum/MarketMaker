"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { Pool } from "~~/types/pool";

const PoolCard = ({ name, user, percentage, id }: Pool) => {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push(`/pools/${id}`);
      }}
      className="max-w-[300px] text-white  flex flex-col gap-y-3 w-full mx-auto p-4 py-6 rounded-md bg-black"
    >
      <span>{name}</span>
      <span>{user}</span>
      <div className="relative h-[12px]  bg-slate-400 rounded-full">
        <div
          style={{ width: `${percentage}%` }}
          className={`absolute  rounded-full bg-orange-400 top-0 left-0 h-full`}
        ></div>
      </div>
    </div>
  );
};

export default PoolCard;
