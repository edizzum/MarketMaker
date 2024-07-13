"use client";

import React, { use, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Pool } from "~~/types/pool";

const PoolIDPage = () => {
  const { id } = useParams();
  // fetch pool data
  const [poolData, setPoolData] = useState<
    (Pool & { balance: number; steps: string[]; properties: { title: string; content: string }[] }) | null
  >(null);
  const getPoolData = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${id}`);
    const data = await res.json();
    setPoolData(data);
  };

  useEffect(() => {
    getPoolData();
  }, [id]);

  const [step, setStep] = useState(0);

  return (
    <div className="px-6 py-6 ">
      <div className="text-2xl mb-6">{poolData?.name ?? "Pool Name"}</div>

      <div
        className=" mx-auto w-full grid grid-cols-2 gap-x-[10%]"
        style={{
          gridTemplateColumns: "1fr auto",
        }}
      >
        <div className="flex flex-col gap-y-4">
          <div className="bg-black rounded-3xl text-white py-6 px-5 flex flex-col gap-y-5">
            {(poolData?.properties ?? Array.from(new Array(5))).map(property => {
              return (
                <div className="flex flex-col gap-y-2 " key={property?.title}>
                  <span className="font-bold">{property?.title ?? "Title"}</span>
                  <span>{property?.content ?? "Content"}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="">
          <div className="min-w-[200px] p-6 gap-y-4 flex-col bg-black py-6 rounded-xl flex items-center justify-center">
            <button className="bg-orange-400 text-white hover:brightness-110 px-4 py-1 rounded-full">
              Check Progress
            </button>
            <span className="text-white font-bold text-xl">
              {poolData?.balance ?? 120}
              {` `}USD
            </span>
            <div className="relative w-full bg-slate-300 rounded-full h-[12px] ">
              <div
                className="absolute bg-orange-400  h-full rounded-full top-0 left-0"
                style={{
                  width: `${poolData?.percentage ?? 60}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="">
        <div className="text-xl  py-2 pt-4">How To Complete Mission</div>
      </div>
      <div className="w-full px-8 pt-4   ">
        <div className="flex rounded-full">
          {(poolData?.steps ?? ["1", "2", "3"]).map((step, i) => {
            return (
              <div
                className="h-1 bg-black relative flex gap-y-4"
                style={{ width: `${100 / (poolData?.steps ?? ["1", "2", "3"]).length}%` }}
              >
                <div className="absolute z-[2] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[12px] bg-black  aspect-square rounded-full"></div>
                <div className="mx-auto mt-4">Step {i + 1}</div>
                <div>{poolData?.steps[i]}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div>{poolData?.steps?.map((step, i) => <div key={i}></div>)}</div>
    </div>
  );
};

export default PoolIDPage;
