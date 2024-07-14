"use client";

import React, { use, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PoolsMock } from "~~/data/pools";
import { Pool } from "~~/types/pool";

const PoolIDPage = () => {
  const { id } = useParams();
  // fetch pool data
  const [poolData, setPoolData] = useState<Pool | null>(PoolsMock.find(pool => pool.id === id) ?? null);
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
    <div className="p-10 flex flex-col w-full gap-3 px-20 ">
      <div className="text-2xl mb-6 font-bold">{poolData?.name ?? "Pool Name"}</div>

      <div className=" mx-auto w-full grid grid-cols-5 gap-6  ">
        <div className="flex flex-col gap-y-4 col-span-3 w-full ">
          <div className="bg-black rounded-3xl text-white py-6 px-5 flex flex-col gap-y-5">
            {poolData?.properties &&
              poolData?.properties.map(property => {
                return (
                  <div className="flex flex-col gap-1.5  " key={property?.title}>
                    <span className="font-bold">{property?.title ?? "Title"}</span>
                    <ul className="list-disc pl-6 font-light">
                      {property?.children?.map(child => {
                        return <li key={child?.content}>{child?.content}</li>;
                      })}
                    </ul>
                  </div>
                );
              })}
          </div>
        </div>
        <div className=" col-span-2 flex justify-center w-full h-full">
          <div className="min-w-[50%] max-h-52 p-6 gap-y-4 flex-col bg-black py-6 rounded-3xl flex items-center justify-center h-full">
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
        <div className="text-2xl  py-2 pt-4 font-bold" style={{ color: "black" }}>How To Complete Mission</div>
      </div>
      <div className="w-full max-w-5xl px-8 pt-4  mx-auto  ">
        <div className="flex rounded-full">
          {poolData?.steps &&
            poolData?.steps.map((step, i) => {
              return (
                <div
                  className="h-1 bg-black relative flex gap-y-4"
                  style={{ width: `${100 / (poolData?.steps || []).length}%` }}
                >
                  <div className="absolute z-[2] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[14px] bg-black  aspect-square rounded-full"></div>
                  <div className="mx-auto mt-4 font-bold">{step}</div>
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
