import { useCallback } from "react";
import { MISSING_DATA_PLACEHOLDER } from '../utils/constants';

type ProductCategory =
  | "WASHINGMACHINES"
  | "WASHERDRIERS"
  | "OVENS"
  | "RANGEHOODS"
  | "DISHWASHERS"
  | "TUMBLEDRYERS"
  | "REFRIGERATINGAPPL"
  | "COOKINGHOBS";

const categoryMap: Record<ProductCategory, string> = {
  WASHINGMACHINES: "Lavatrice",
  WASHERDRIERS: "Lavasciuga",
  OVENS: "Forno",
  RANGEHOODS: "Cappa",
  DISHWASHERS: "Lavastoviglie",
  TUMBLEDRYERS: "Asciugatrice",
  REFRIGERATINGAPPL: "Frigorifero",
  COOKINGHOBS: "Piano cottura",
};

export function useProductCategoryLabel() {
  const getCategoryLabel = useCallback((category?: string): string | undefined => {
    if (!category) {return MISSING_DATA_PLACEHOLDER;}
    return categoryMap[category as ProductCategory];
  }, []);

  return { getCategoryLabel };
}