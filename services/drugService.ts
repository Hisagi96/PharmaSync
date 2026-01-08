import { DrugEntry } from '../types';

// OpenFDA API for drug product labeling
const API_ENDPOINT = "https://api.fda.gov/drug/ndc.json";

export const searchDrugs = async (query: string): Promise<DrugEntry[]> => {
  if (!query || query.length < 3) return [];

  try {
    // Search for drugs by brand name using OpenFDA syntax
    const response = await fetch(`${API_ENDPOINT}?search=brand_name:"${encodeURIComponent(query)}*"&limit=5`);
    
    if (!response.ok) {
        return [];
    }

    const data = await response.json();

    if (!data.results) return [];

    // Map OpenFDA results to DrugEntry
    const suggestions: DrugEntry[] = data.results.map((item: any) => ({
      id: item.product_id,
      name: item.brand_name,
      genericName: item.generic_name,
    }));

    // Deduplicate by name to avoid showing the same drug with different package sizes
    const uniqueMap = new Map();
    suggestions.forEach(item => {
        if(!uniqueMap.has(item.name)) {
            uniqueMap.set(item.name, item);
        }
    });

    return Array.from(uniqueMap.values());
  } catch (error) {
    console.warn("Drug search failed", error);
    return [];
  }
};