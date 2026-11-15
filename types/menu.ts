export type Price = {
  half?: number;
  full?: number;
  single?: number;
  plate?: number;
  oil?: number;
  butter?: number;
  price?: number;
};

export type Item = {
  id: string;
  en: string;
  gu: string;
  price: Price;
  soldOut?: boolean;
  featured?: boolean;
};

export type Section = {
  id: string;
  en: string;
  gu: string;
  columns: ("half" | "full")[] | ("oil" | "butter")[] | ("single" | "plate")[] | ["price"] | string[];
  availability?: { from: string; to: string };
  notes?: { en: string; gu?: string }[];
  items: Item[];
  hidden?: boolean;
  group?: string;
};

export type RestaurantInfo = {
  name: string;
  guName: string;
  tagline: string;
  guTagline: string;
  since: number;
  address: string;
  guAddress: string;
  city: string;
  guCity: string;
  phones: string[];
  mapsUrl: string;
};

export type MenuData = {
  restaurant: RestaurantInfo;
  sections: Section[];
};
