"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pool } from "~~/types/pool";

const PoolCard = ({ name, user, percentage, id }: Pool) => {
  const router = useRouter();
  return (
    <Link
      href={`/pools/${id}`}
      passHref
      className="max-w-[320px] text-white  flex flex-col gap-y-3 w-full mx-auto p-4 py-8  bg-black rounded-3xl"
    >
      <span className="font-semibold">{name}</span>
      <span>{user}</span>
      <div className="relative h-[12px]  bg-slate-400 rounded-full">
        <div
          style={{ width: `${percentage}%` }}
          className={`absolute  rounded-full bg-orange-400 top-0 left-0 h-full`}
        ></div>
      </div>
    </Link>
  );
};

export default PoolCard;
