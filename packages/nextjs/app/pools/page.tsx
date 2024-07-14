import React from "react";
import PoolCard from "~~/components/pools/pool-card";
import { Pool } from "~~/types/pool";
import { PoolsMock } from "~~/data/pools";



const PoolsPage = () => {
  return (
    <div className=" flex flex-col gap-6 w-full justify-center text-center pt-6">
      <h2 className="block text-4xl font-bold">MarketMaker Pools</h2>
      <div className="grid grid-cols-3 gap-6 mx-auto w-[80%] pt-12 ">
        {PoolsMock.map((params, i) => (
          <PoolCard
            id={params.id}
            key={i}
            name={`${params.name}`}
            user={`${params.user}`}
            percentage={params.percentage}
          />
        ))}
      </div>
    </div>
  );
};

export default PoolsPage;
