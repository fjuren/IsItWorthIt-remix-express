export interface Deal {
    internalName: string;
    title: string;
    metacriticLink: string;
    dealID: string;
    storeID: string;
    gameID: string;
    salePrice: string;
    normalPrice: string;
    isOnSale: string;
    savings: string;
    metacriticScore: string;
    steamRatingText: string;
    steamRatingPercent: string;
    steamRatingCount: string;
    steamAppID: string;
    releaseDate: number;
    lastChange: number;
    dealRating: string;
    thumb: string;
  }
  export type Deals = Deal[];

  export interface SortOption {
    id: string;
    value: string;
    label: string;
    direction: string;
  }
  
  export interface SortOptions {
    DealRating: SortOption;
    DealRatingAsc: SortOption;
    Title: SortOption;
    TitleDesc: SortOption;
    Savings: SortOption;
    Price: SortOption;
    PriceDesc: SortOption;
    Metacritic: SortOption;
    MetacriticAsc: SortOption;
    Reviews: SortOption;
    Release: SortOption;
    ReleaseAsc: SortOption;
    Store: SortOption;
    Recent: SortOption;
    [key: string]: SortOption; // Doing this for looping through sortOptions using the sortoption as a key, like: sortOptions[key].value. Dynamic typesafety
  }