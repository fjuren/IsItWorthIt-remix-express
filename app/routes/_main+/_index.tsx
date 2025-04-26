import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionFunctionArgs, MetaFunction, useFetcher } from 'react-router';
import { useLoaderData, Link } from 'react-router-dom';
import { Badge } from '~/components/UI/Badge';
import { CommentButton } from '~/components/UI/Comments';
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
import { UpvoteButton } from '~/components/UI/Upvote';
import { DownvoteButton } from '~/components/UI/Downvote';
import { WishlistButton } from '~/components/UI/Wishlist';
import { Deal, Deals } from '~/types/deal';
import { Store, Stores } from '~/types/store';

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

async function fetchStoresCheapShark(): Promise<Stores> {
  const requestOptions = {
    method: 'GET',
  };
  
  const response = await fetch(
    'https://www.cheapshark.com/api/1.0/stores',
    requestOptions
  );

  if (!response.ok) {
    throw new Error('Failed to fetch stores')
  }

  const listOfStores: Stores = await response.json();

  return listOfStores;
}

async function fetchDealsCheapShark(pageNum: number, pageSize: number): Promise<Deals> {
  const requestOptions = {
    method: 'GET',
  };
  
  const response = await fetch(
    `https://www.cheapshark.com/api/1.0/deals?pageNumber=${pageNum}&pageSize=${pageSize}`,
    requestOptions
  );

  if (!response.ok) {
    throw new Error('Failed to fetch game deals')
  }

  const listOfDeals: Deals = await response.json();

  return listOfDeals;
}


export async function loader() {
  const INITIAL_PAGE = 1;
  const PAGE_SIZE = 60;
  const gameDeals = await fetchDealsCheapShark(INITIAL_PAGE, PAGE_SIZE)
  const stores = await fetchStoresCheapShark()

  return {initialGames: gameDeals, hasMore: gameDeals.length === PAGE_SIZE, stores}
 }

// to load more game deals
export async function action({request}:  ActionFunctionArgs) {
  const formData = await request.formData();
  const PAGE_NUM = parseInt(formData.get("pageNumber") as string) || 1;
  const PAGE_SIZE = parseInt(formData.get("pageSize") as string) || 60;
  
  // Fetch deals for the specified page
  const gameDeals = await fetchDealsCheapShark(PAGE_NUM, PAGE_SIZE);

  return { gameDeals, hasMore: gameDeals.length === PAGE_SIZE }
}

export default function HomeRoute() {
  const { initialGames, hasMore: initHasMore, stores } = useLoaderData<typeof loader>();
  const [ gameDeals, setGameDeals ] = useState<Deals>(initialGames)
  const [ hasMore, setHasMore ] = useState(initHasMore)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ currentPage, setCurrentPage ] = useState(1)
  // const theme: string = useOutletContext(); TODO determine if I still need theme
  
  const fetcher = useFetcher()
  const observeRef = useRef<IntersectionObserver | null>(null)
  const lastGameRef = useRef<HTMLAnchorElement | null>(null);

  const PAGE_SIZE = 60;

  // loads next set of games
  const loadNextPage = useCallback(() => {
    if (isLoading || !hasMore || fetcher.state !== "idle") return

    setIsLoading(true);
    const nextPage = currentPage + 1;

    const formData = new FormData()
    formData.append("pageNumber", nextPage.toString());
    formData.append("pageSize", PAGE_SIZE.toString());

    fetcher.submit(formData, {method: "POST"});
    setCurrentPage(nextPage)
  }, [isLoading, hasMore, fetcher, currentPage]);

  // for new data from fetcher
  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle" && isLoading) {
      const { gameDeals: newGameDeals, hasMore: moreGames } = fetcher.data;

      setGameDeals(prev => [...prev, ...newGameDeals]);
      setHasMore(moreGames)
      setIsLoading(false);
    }
  }, [fetcher.data, fetcher.state, isLoading]);


  useEffect(() => {
    if (!hasMore || isLoading) return;

    if (observeRef.current) {
      observeRef.current.disconnect()
    }

    observeRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadNextPage();
      }
    },
  {threshold: 0.1});

  if (lastGameRef.current) {
    observeRef.current.observe(lastGameRef.current)
  }

  return () => {
    if (observeRef.current) {
      observeRef.current.disconnect();
    }
  }
  }, [hasMore, isLoading, loadNextPage])


  return (
    <>
      <h1 className="font-bold text-center text-4xl">
        Find games worth <br /> your while
      </h1>
      {gameDeals.map((game: Deal, index: number) => {
                if (index === gameDeals.length - 1) {
          return (
            <GameCard key={index} gameId={game.gameID} ref={lastGameRef}>
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
              <p className="line-through text-slate-500">${game.normalPrice}</p>
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
              <Button variant={'default'} asChild>
                <Link
                  to={`https://www.cheapshark.com/redirect?dealID=${game.dealID}`}
                >
                  Store
                </Link>
              </Button>
            </GameCardContent4>
          </GameCard>
          )
                }
                return (
        <GameCard key={index} gameId={game.gameID}>
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
            <p className="line-through text-slate-500">${game.normalPrice}</p>
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
            <Button variant={'default'} asChild>
              <Link
                to={`https://www.cheapshark.com/redirect?dealID=${game.dealID}`}
              >
                Store
              </Link>
            </Button>
          </GameCardContent4>
        </GameCard>
                )
})}

      {(isLoading || fetcher.state !== "idle") && (
        <div className="loading-indicator">
          Loading more games...
        </div>
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
