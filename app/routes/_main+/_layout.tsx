import { Outlet } from 'react-router-dom';
import { LoaderFunctionArgs, useLoaderData } from 'react-router';
import { Document } from '~/root';
import { SideNav } from '~/components/UI/SideNav';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { filterOptions, gameTitle } from '~/utils/constants';
import { Stores } from '~/types/store';
import { Deals } from '~/types/deal';

// Layout with SideNav
export async function fetchStoresCheapShark(): Promise<Stores> {
  const requestOptions = {
    method: 'GET',
  };

  const response = await fetch(
    'https://www.cheapshark.com/api/1.0/stores',
    requestOptions
  );

  if (!response.ok) {
    if (response.status === 429) {
      // console.log("Retry-After", response.headers.get('Retry-After'))
      throw new Error('Rate limit reached. Try again later');
    }
    throw new Error('Failed to fetch game deals');
  }

  const listOfStores: Stores = await response.json();

  return listOfStores;
}

export async function fetchDealsCheapShark(
  pageNum: number,
  pageSize: number,
  gameTitle?: string,
  storeID?: string,
  lowerPrice?: string,
  upperPrice?: string,
  onSale?: string,
  maxAge?: string,
  metacritic?: string,
  steamRating?: string,
  // steamworks?: string,
  AAA?: string,
  sortBy?: string,
  desc?: string
): Promise<Deals> {
  const requestOptions = {
    method: 'GET',
  };

  // For search
  const includeGameTitle = gameTitle ? `&title=${gameTitle}` : '';

  // determines whether the respective filter is applied. If so, add it as a query param to the cheapshark api endpoint
  // For Filter
  const includeStoreID = storeID ? `&storeID=${storeID}` : '';
  const includeLowerPrice = lowerPrice ? `&lowerPrice=${lowerPrice}` : '';
  const includeUpperPrice = upperPrice ? `&upperPrice=${upperPrice}` : '';
  const includeOnSale = onSale ? `&onSale=${onSale}` : '';
  const includeMaxAge = maxAge ? `&maxAge=${maxAge}` : '';
  const includeMetacritic = metacritic ? `&metacritic=${metacritic}` : '';
  const includeSteamRating = steamRating ? `&steamRating=${steamRating}` : '';
  // const includeSteamworks = steamworks ? `&steamworks=${steamworks}` : '';
  const includeAAA = AAA ? `&AAA=${AAA}` : '';

  // For sort
  const includeSortBy = sortBy ? `&sortBy=${sortBy}` : '';
  const includeDesc = desc ? `&desc=${desc}` : '';

  const response = await fetch(
    `https://www.cheapshark.com/api/1.0/deals?pageNumber=${pageNum}&pageSize=${pageSize}${includeGameTitle}${includeStoreID}${includeLowerPrice}${includeUpperPrice}${includeOnSale}${includeMaxAge}${includeMetacritic}${includeSteamRating}${includeAAA}${includeSortBy}${includeDesc}`,
    requestOptions
  );

  if (!response.ok) {
    if (response.status === 429) {
      // console.log("Retry-After", response.headers.get('Retry-After'))
      throw new Error('Rate limit reached. Try again later');
    }
    throw new Error('Failed to fetch game deals');
  }

  const listOfDeals: Deals = await response.json();

  return listOfDeals;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // for infitine scroll
  const INITIAL_PAGE = 0;
  const PAGE_SIZE = 60;

  const url = new URL(request.url);
  // game keyword queried
  const gameTitleSearch = url.searchParams.get(gameTitle) || '';
  // filtered options
  const storeIDFilter = (
    url.searchParams.getAll(filterOptions.storeID) || ['']
  ).join(',');
  const lowerPriceFilter = url.searchParams.get(filterOptions.lowerPrice) || '';
  const upperPriceFilter = url.searchParams.get(filterOptions.upperPrice) || '';
  const onSaleFilter = url.searchParams.get(filterOptions.onlyGameSales) || '';
  const maxAgeFilter = url.searchParams.get(filterOptions.maxAge) || '';
  const metacriticFilter = url.searchParams.get(filterOptions.metacritic) || '';
  const steamRatingFilter =
    url.searchParams.get(filterOptions.steamRating) || '';
  // const steamworksFilter = url.searchParams.get(filterOptions.steamworks) || '';
  const aaaFilter = url.searchParams.get(filterOptions.AAA) || '';
  // get sort params (sort gives what to sort by, desc says whether to sort descending (0) or ascending (1))
  const sortBy = url.searchParams.get('sortBy') || '';
  const desc = url.searchParams.get('desc') || '';

  // create url to check whether user uses search

  const gameDeals = await fetchDealsCheapShark(
    INITIAL_PAGE,
    PAGE_SIZE,
    gameTitleSearch,
    storeIDFilter,
    lowerPriceFilter,
    upperPriceFilter,
    onSaleFilter,
    maxAgeFilter,
    metacriticFilter,
    steamRatingFilter,
    aaaFilter,
    sortBy,
    desc
  );

  const stores = await fetchStoresCheapShark();

  return {
    initialGames: gameDeals,
    searchGameTitle: gameDeals,
    stores,
    initHasMore: gameDeals.length === PAGE_SIZE,
  };
}

export default function MainLayout() {
  // const theme = useOutletContext();
  const data = useLoaderData<typeof loader>();

  // throw new Error('Component error');
  return (
    <>
      {/* desktop sidenav (sidenav hidden on mobile) /} */}
      <aside>
        <SideNav data={data.stores} />
      </aside>
      {/* {/ main content */}
      <main className="flex flex-col flex-1 items-center gap-4 overflow-auto">
        <Outlet context={data} />
      </main>
    </>
  );
}

export function ErrorBoundary() {
  return (
    <Document>
      <GeneralErrorBoundary />
    </Document>
  );
}
