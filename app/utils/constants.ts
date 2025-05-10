import { SortOptions } from "~/types/deal";

// cookie key variable
export const authSessionKey = 'auth-Session';
export const verifySessionKey = 'verified-session-key';
export const unverifiedSessionKey = 'unverified-session-key';
export const lastVerifiedTimeKey = 'last-verified-time';
export const rememberMeKey = 'remember-me';

// verification type key
export const twoFAVerifyVerificationType = '2fa-verify';
export const twoFAVerificationEnabledType = '2fa-enabled';
export const emailType = 'email';
export const resetPasswordType = 'reset-password';
export const changeEmailType = 'change-email';

// search params
export const codeSearchParams = 'code';
export const typeSearchParams = 'type';
export const targetSearchParams = 'target';

// game search params
export const gameTitle = 'gameTitle'

// Filter search params
export const filterOptions = {
    lowerPrice: 'lowerPrice',
    upperPrice: 'upperPrice',
    maxAge: 'maxAge',
    steamRating: 'steamRating',
    metacritic: 'metacritic',
    onlyGameSales: 'onlyGameSales',
    // steamworks: 'steamworks',
    storeID: 'storeID',
    AAA: 'AAA'
  };
  
// Sort options
// Params: DealRating (Default from API), Title, Savings, Price, Metacritic, Reviews, Release, Store, Recent
// Sort direction: desc (Default 0)
export const sortOptions: SortOptions = {
  DealRating: {
    id: 'DealRating0',
    value: 'DealRating',
    label: 'Deal Rating: High to Low',
    direction: '0',
  },
  DealRatingAsc: {
    id: 'DealRating1',
    value: 'DealRating',
    label: 'Deal Rating: Low to High',
    direction: '1',
  },
  Title: {
    id: 'Title0',
    value: 'Title',
    label: 'Title: A to Z',
    direction: '0',
  },
  TitleDesc: {
    id: 'Title1',
    value: 'Title',
    label: 'Title: Z to A',
    direction: '1',
  },
  Savings: {
    id: 'Savings0', // descending
    value: 'Savings',
    label: 'Discount: Highest First',
    direction: '0',
  },
  Price: {
    id: 'Price0',
    value: 'Price',
    label: 'Price: Low to High',
    direction: '0',
  },
  PriceDesc: {
    id: 'Price1', 
    value: 'Price',
    label: 'Price: High to Low',
    direction: '1',
  },
  Metacritic: {
    id: 'Metacritic0', //
    value: 'Metacritic',
    label: 'Metacritic Score: High to Low',
    direction: '0',
  },
  MetacriticAsc: {
    id: 'Metacritic1', 
    value: 'Metacritic',
    label: 'Metacritic Score: Low to High',
    direction: '1',
  },
  Reviews: {
    id: 'Reviews0', // descending
    value: 'Reviews',
    label: 'Steam Reviews: Best First',
    direction: '0',
  },
  Release: {
    id: 'Release0', // descending
    value: 'Release',
    label: 'Release Date: Newest First',
    direction: '0',
  },
  ReleaseAsc: {
    id: 'Release1', // ascending
    value: 'Release',
    label: 'Release Date: Oldest First',
    direction: '1',
  },
  Store: {
    id: 'Store1', // ascending
    value: 'Store',
    label: 'Store Name: A to Z',
    direction: '1',
  },
  Recent: {
    id: 'Recent0', // descending
    value: 'Recent',
    label: 'Deal Date: Most Recent First',
    direction: '0',
  },
}