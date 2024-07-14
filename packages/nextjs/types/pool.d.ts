export type Pool = {
  id: string;
  name: string;
  user: string;
  percentage: number;
  properties?: {
    title: string;
    children: {
      content: string;
    }[];
  }[];
  balance?: number;
  steps?: string[];
};

export type Pools = Pool[];
