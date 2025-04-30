import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  useFetcher,
  useLocation,
} from 'react-router';
import { useLoaderData, Link, Form } from 'react-router-dom';
import { Badge } from '~/components/UI/Badge';
import { CommentButton } from '~/components/UI/CommentsAndIcon';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import {
  GameCard,
  GameCardImage,
  GameCardHeader,
  GameCardTitle,
  GameCardDescription,
  GameCardSocial,
  GameCardContent1,
  GameCardContent2,
  GameCardContent3,
  GameCardContent4,
} from '~/components/UI/GameCard';
import { Button } from '~/components/UI/Button';
import { UpvoteButton } from '~/components/UI/UpvoteIcon';
import { DownvoteButton } from '~/components/UI/Downvote';
import { WishlistButton } from '~/components/UI/WishlistIcon';
import { Deal, Deals } from '~/types/deal';
import { Store, Stores } from '~/types/store';
import { InputWithIcon } from '~/components/UI/InputWithIcon';
import { Search } from 'lucide-react';
import { getFormProps, useForm } from '@conform-to/react';
import { z } from 'zod';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { FormOrFieldErrorsList } from '~/utils/misc';
import { FilterGames } from '~/components/UI/Dialog';

// look at data mutations
export const meta: MetaFunction = () => {
  return [
    { title: 'Home | IsItWorthIt?' },
    {
      name: 'description',
      content: 'Find games that are worth it for the price',
    },
  ];
};

function formatPercentage(value: string) {
  return `${Math.round(parseFloat(value))}%`;
}

const SearchSchema = z.object({
  gameTitle: z.string({ required_error: 'Please enter a game title' }),
});

async function fetchStoresCheapShark(): Promise<Stores> {
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

async function fetchDealsCheapShark(
  pageNum: number,
  pageSize: number
): Promise<Deals> {
  const requestOptions = {
    method: 'GET',
  };

  const response = await fetch(
    `https://www.cheapshark.com/api/1.0/deals?onSale=0&pageNumber=${pageNum}&pageSize=${pageSize}`,
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

// gameTitle can be any string; doesnn't need to fully match a game title from the api
async function fetchGameCheapShark(
  gameTitle: string,
  pageNum: number,
  pageSize: number
): Promise<any> {
  const requestOptions = {
    method: 'GET',
  };

  const response = await fetch(
    `https://www.cheapshark.com/api/1.0/deals?onSale=0&title=${gameTitle}&pageNumber=${pageNum}&pageSize=${pageSize}`,
    requestOptions
  );

  if (!response.ok) {
    if (response.status === 429) {
      // console.log("Retry-After", response.headers.get('Retry-After'))
      throw new Error('Rate limit reached. Try again later');
    }
    throw new Error('Failed to fetch game deals');
  }

  const game = await response.json();

  return game;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // for infitine scroll
  const INITIAL_PAGE = 0;
  const PAGE_SIZE = 60;

  let gameDeals;

  // create url to check whether user uses search
  const url = new URL(request.url);
  if (url.search) {
    // for search data
    console.log(true);
    // search min length is 1; url searchparams will not = null, only string
    const gameTitleSearch = url.searchParams.get('gameTitle') || '';
    console.log(url);
    gameDeals = await fetchGameCheapShark(
      gameTitleSearch,
      INITIAL_PAGE,
      PAGE_SIZE
    );
  } else {
    gameDeals = await fetchDealsCheapShark(INITIAL_PAGE, PAGE_SIZE);
  }

  console.log('gameDeals loaded: ', gameDeals[0]);

  const stores = await fetchStoresCheapShark();

  return {
    initialGames: gameDeals,
    searchGameTitle: gameDeals,
    stores,
    hasMore: gameDeals.length === PAGE_SIZE,
  };
}

// to load more game deals (based either on a specific game title search or no search/non-specific fetch)
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // console.log('action formdata', formData)
  const PAGE_NUM = parseInt(formData.get('pageNumber') as string) || 0;
  const PAGE_SIZE = parseInt(formData.get('pageSize') as string) || 60;
  const searchGameTitle = formData.get('gameTitle') as string;
  console.log('searchGameTitle', searchGameTitle);

  let gameDeals;
  if (searchGameTitle) {
    // fetch games per search search game title
    gameDeals = await fetchGameCheapShark(searchGameTitle, PAGE_NUM, PAGE_SIZE);
  } else {
    // fetch regular deal list
    gameDeals = await fetchDealsCheapShark(PAGE_NUM, PAGE_SIZE);
  }

  return { gameDeals, hasMore: gameDeals.length === PAGE_SIZE };
}

export default function HomeRoute() {
  const {
    initialGames,
    stores,
    hasMore: initHasMore,
  } = useLoaderData<typeof loader>();

  console.log('initialGames', initialGames[0]);

  // initialGames will be set to either regular games or searched games
  const [gameDeals, setGameDeals] = useState<Deals>(initialGames);
  console.log('gameDeals: ', gameDeals);
  const [hasMore, setHasMore] = useState(initHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  // const theme: string = useOutletContext(); TODO determine if I still need theme

  const fetcher = useFetcher();
  const observeRef = useRef<IntersectionObserver | null>(null);
  const lastGameRef = useRef<HTMLAnchorElement | null>(null);

  const PAGE_SIZE = 60;

  // loads next set of games
  const loadNextPage = useCallback(() => {
    if (isLoading || !hasMore || fetcher.state !== 'idle') return;

    setIsLoading(true);
    const nextPage = currentPage + 1;

    const formData = new FormData();
    formData.append('pageNumber', nextPage.toString());
    formData.append('pageSize', PAGE_SIZE.toString());

    // if game search term present, append to formData for infinite scroll
    const searchParams = new URLSearchParams(window.location.search);
    const searchTerm = searchParams.get('gameTitle');
    if (searchTerm) {
      formData.append('gameTitle', searchTerm);
    }

    // console.log('homeroute formdata', formData)
    fetcher.submit(formData, { method: 'POST' });
    setCurrentPage(nextPage);
  }, [isLoading, hasMore, fetcher, currentPage]);

  // handles data from fetcher, appending next set of 60 games to prior list
  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle' && isLoading) {
      const { gameDeals: newGameDeals, hasMore: moreGames } = fetcher.data;

      setGameDeals((prev) => [...prev, ...newGameDeals]);
      setHasMore(moreGames);
      setIsLoading(false);
    }
  }, [fetcher.data, fetcher.state, isLoading]);

  // handles search
  const location = useLocation();
  useEffect(() => {
    setGameDeals(initialGames);
    setCurrentPage(0);
    setHasMore(initialGames.length === PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    // cleans (by disconnecting) previous observer in case it exists
    if (observeRef.current) {
      observeRef.current.disconnect();
    }

    observeRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (lastGameRef.current) {
      observeRef.current.observe(lastGameRef.current);
    }

    return () => {
      if (observeRef.current) {
        observeRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadNextPage]);

  const [form] = useForm({
    id: 'gameTitle',
    defaultValue: {},
    constraint: getZodConstraint(SearchSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SearchSchema });
    },
  });

  return (
    <>
      <h1 className="font-bold text-center text-4xl">
        Find games worth <br /> your while
      </h1>
      <div>
        <Form method="GET" {...getFormProps(form)} className="flex gap-2">
          <InputWithIcon
            startIcon={Search}
            name="gameTitle"
            type="search"
            placeholder="Search game title"
          />
          <Button type="submit" variant={'secondary'}>
            Search
          </Button>
          <div>
            <FormOrFieldErrorsList data={form.errors} errorID={form.errorId} />
          </div>
        </Form>
      </div>
      <div>
        <FilterGames />
      </div>
      {gameDeals.length > 0 ? (
        gameDeals.map((game: Deal, index: number) => {
          return (
            <GameCard
              key={index}
              gameId={game.gameID}
              // handles ref observation for determining last game card; support infinite scroll
              ref={index === gameDeals.length - 1 ? lastGameRef : null}
            >
              <GameCardImage
                src={game.thumb}
                alt={`${game.title} image`}
              ></GameCardImage>
              <GameCardHeader>
                <GameCardTitle>{game.title}</GameCardTitle>
                <GameCardDescription>
                  <img
                    className="h-4 w-4"
                    src={`https://www.cheapshark.com${
                      stores.find((o: Store) => o.storeID === game.storeID)?.[
                        'images'
                      ]['icon']
                    }`}
                    alt={`${
                      stores.find((o: Store) => o.storeID === game.storeID)?.[
                        'storeName'
                      ]
                    }'s logo`}
                  />
                  <p>
                    {
                      stores.find((o: Store) => o.storeID === game.storeID)?.[
                        'storeName'
                      ]
                    }
                  </p>
                </GameCardDescription>
              </GameCardHeader>
              <GameCardSocial>
                <UpvoteButton />
                <DownvoteButton />
                <CommentButton />
                <WishlistButton />
              </GameCardSocial>
              <GameCardContent1>
                <p className="">${game.salePrice} USD</p>
                <p className="line-through text-slate-500">
                  ${game.normalPrice}
                </p>
                <Badge>-{formatPercentage(game.savings)}</Badge>
              </GameCardContent1>
              {/* <GameCardContent2>
              <p>{game.steamRatingCount} votes</p>
              <p>{game.steamRatingPercent}%</p>
              <p>{game.steamRatingText} rating</p>
            </GameCardContent2> */}
              <GameCardContent3>
                <p>Deal rating: {game.dealRating}</p>
              </GameCardContent3>
              <GameCardContent4>
                <Button className="z-10" variant={'default'} asChild>
                  <Link
                    onClick={(e) => {
                      e.stopPropagation(); // Stops the event from bubbling up to the gamecard (let's you access the link)
                    }}
                    to={`https://www.cheapshark.com/redirect?dealID=${game.dealID}`}
                  >
                    Store
                  </Link>
                </Button>
              </GameCardContent4>
            </GameCard>
          );
        })
      ) : (
        <div className="no-search-found">Sorry, no games found</div>
      )}

      {(isLoading || fetcher.state !== 'idle') && (
        <div className="loading-indicator">Loading more games...</div>
      )}

      {!hasMore && gameDeals.length > 0 && (
        <div className="end-message">
          <p>You&apos;ve reached the end of available deals!</p>
        </div>
      )}
    </>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        500: () => <p>Sorry, something went wrong! Try again later.</p>,
      }}
    />
  );
}
