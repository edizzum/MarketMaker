import React from "react";
import PoolCard from "~~/components/pools/pool-card";
import { Pool } from "~~/types/pool";

const PoolsMock: Pool[] = Array.from(new Array(10)).map((_, i) => ({
  name: `Pool ${i}`,
  user: `User ${i}`,
  percentage: i * 10,
  id: i.toString(),
}));

const PoolsPage = () => {
  return (
    <div className="grid grid-cols-3 mx-auto w-[80%] gap-y-4 pt-12 ">
      {PoolsMock.map((params, i) => (
        <PoolCard
          id={params.id}
          key={i}
          name={`Pool ${params.name}`}
          user={`User ${params.user}`}
          percentage={params.percentage}
        />
      ))}
    </div>
  );
};

export default PoolsPage;
