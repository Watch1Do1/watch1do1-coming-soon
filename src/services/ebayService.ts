export interface EbayItem {
    itemId: string;
    title: string;
    price: {
      value: string;
      currency: string;
    };
    image: {
      imageUrl: string;
    };
    itemWebUrl: string;
    condition: string;
  }
  
  export const ebayService = {
    searchItems: async (query: string): Promise<EbayItem[]> => {
      try {
        const response = await fetch(`/api/ebay/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.itemSummaries) {
          return data.itemSummaries.map((item: any) => ({
            itemId: item.itemId,
            title: item.title,
            price: item.price,
            image: item.image,
            itemWebUrl: item.itemWebUrl,
            condition: item.condition
          }));
        }
        return [];
      } catch (error) {
        console.error("Error calling eBay search proxy:", error);
        return [];
      }
    }
  };
  