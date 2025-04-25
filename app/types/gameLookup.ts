export interface gameLookupResponse {
    info: {
      title: string;
      steamAppID: string;
      thumb: string;
    };
    cheapestPriceEver: {
      price: string;
      date: number;
    };
    deals: Array<{
      storeID: string;
      dealID: string;
      price: string;
      retailPrice: string;
      savings: string;
    }>;
  }