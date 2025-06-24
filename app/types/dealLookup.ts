export interface DealLookupResponse {
  gameInfo: {
    storeID: string;
    gameID: string;
    name: string;
    steamAppID: string;
    salePrice: string;
    retailPrice: string;
    steamRatingText: string;
    steamRatingPercent: string;
    steamRatingCount: string;
    metacriticScore: string;
    metacriticLink: string;
    releaseDate: number;
    publisher: string;
    steamworks: string;
    thumb: string;
  };
  cheaperStores: {
    dealID: string;
    storeID: string;
    salePrice: string;
    retailPrice: string;
  }[];
  cheapestPrice: {
    date: number;
  };
}
