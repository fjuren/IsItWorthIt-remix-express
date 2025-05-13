import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActionFunctionArgs,
  MetaFunction,
  useFetcher,
  useLocation,
  useNavigate,
  useNavigation,
  useOutletContext,
} from 'react-router';
import { Link } from 'react-router-dom';
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
  GameCardContent3,
  GameCardContent4,
} from '~/components/UI/GameCard';
import { Button } from '~/components/UI/Button';
import { UpvoteButton } from '~/components/UI/UpvoteIcon';
import { DownvoteButton } from '~/components/UI/Downvote';
import { WishlistButton } from '~/components/UI/WishlistIcon';
import { Deal, Deals } from '~/types/deal';
import { Store } from '~/types/store';
import { DialogFilters } from '~/components/UI/DialogFilters';
import { gameTitle, filterOptions } from '~/utils/constants';
import { SelectSort } from '~/components/UI/Select';
import { SkeletonCard } from '~/components/UI/Loading';
import { fetchDealsCheapShark } from './_layout';
import { resetInputs } from '~/utils/misc';

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

// to load more game deals (based either on a specific game title search or no search/non-specific fetch)
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // console.log('action formdata', formData)
  const PAGE_NUM = parseInt(formData.get('pageNumber') as string) || 0;
  const PAGE_SIZE = parseInt(formData.get('pageSize') as string) || 60;

  const url = new URL(request.url);
  // game keyword queried
  const gameTitleSearch = url.searchParams.get(gameTitle) || '';
  // filtered options
  const storeIDFilter = (url.searchParams.getAll(filterOptions.storeID) || ['']).join(',');
  const lowerPriceFilter = url.searchParams.get(filterOptions.lowerPrice) || '';
  const upperPriceFilter = url.searchParams.get(filterOptions.upperPrice) || '';
  const onSaleFilter = url.searchParams.get(filterOptions.onlyGameSales) || '';
  const maxAgeFilter = url.searchParams.get(filterOptions.maxAge) || '';
  const metacriticFilter = url.searchParams.get(filterOptions.metacritic) || '';
  const steamRatingFilter = url.searchParams.get(filterOptions.steamRating) || '';
  // const steamworksFilter = url.searchParams.get(filterOptions.steamworks) || '';
  const aaaFilter = url.searchParams.get(filterOptions.AAA) || '';
  // get sort params (sort gives what to sort by, desc says whether to sort descending (0) or ascending (1))
  const sortBy = url.searchParams.get("sortBy") || ''
  const desc = url.searchParams.get("desc") || ''


  // create url to check whether user uses search

  const gameDeals = await fetchDealsCheapShark(PAGE_NUM, PAGE_SIZE, gameTitleSearch, storeIDFilter, lowerPriceFilter, upperPriceFilter, onSaleFilter, maxAgeFilter, metacriticFilter, steamRatingFilter, aaaFilter, sortBy, desc);

  return { gameDeals, hasMore: gameDeals.length === PAGE_SIZE };
}

export default function HomeRoute() {
  const navigate = useNavigate()
  const navigation = useNavigation();
  const { initialGames, stores, initHasMore } = useOutletContext<any>();

  // initialGames will be set to either regular games or searched games
  const [gameDeals, setGameDeals] = useState<Deals>(initialGames);
  // console.log('gameDeals: ', gameDeals[0]);
  const [hasMore, setHasMore] = useState(initHasMore);
  // for infinite scroll
  const [isInfinite, setIsInfinite] = useState(false);
  // for search, filter, sort
  const isLoading = navigation.state === "loading" && navigation.location?.pathname === "/" &&
  navigation.state === "loading"
  const [currentPage, setCurrentPage] = useState(0);
  // const theme: string = useOutletContext(); TODO determine if I still need theme

  const fetcher = useFetcher();
  const observeRef = useRef<IntersectionObserver | null>(null);
  const lastGameRef = useRef<HTMLAnchorElement | null>(null);

  const PAGE_SIZE = 60;

  // loads next set of games
  const loadNextPage = useCallback(() => {
    if (isInfinite || !hasMore || fetcher.state !== 'idle') return;

    setIsInfinite(true);
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
  }, [isInfinite, hasMore, fetcher, currentPage]);

  // handles data from fetcher, appending next set of 60 games to prior list
  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle' && isInfinite) {
      const { gameDeals: newGameDeals, hasMore: moreGames } = fetcher.data;

      setGameDeals((prev) => [...prev, ...newGameDeals]);
      setHasMore(moreGames);
      setIsInfinite(false);
    }
  }, [fetcher.data, fetcher.state, isInfinite]);

  // handles search
  const location = useLocation();
  useEffect(() => {
    setGameDeals(initialGames);
    setCurrentPage(0);
    setHasMore(initialGames.length === PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    if (!hasMore || isInfinite) return;

    // cleans (by disconnecting) previous observer in case it exists
    if (observeRef.current) {
      observeRef.current.disconnect();
    }

    observeRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isInfinite) {
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
  }, [hasMore, isInfinite, loadNextPage]);


  return (
    <>
      <h1 className="font-bold text-center text-4xl m-0">
        Find games worth <br /> your while
      </h1>
      <div className='flex flex-col mb-4 gap-5 w-[96%] md:items-center'>
        {/* <GameSearch /> */}
        <div className='flex flex-col md:self-start gap-2'>
          <div className='flex flex-col'>
            <SelectSort  />
          </div>
          <div className='flex flex-col md:hidden'>
            <DialogFilters stores={stores}/>
            <Button className='self-end' variant={"link"} onClick={() => {resetInputs('filter', navigate)}}>Clear filters</Button>
          </div>
        </div>
      </div>
      {gameDeals.length > 0 ? (
        gameDeals.map((game: Deal, index: number) => {
          return (
            <>
            {isLoading ? <SkeletonCard /> : 
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
                        <p>Steam rating: {game.steamRatingPercent}%</p>
                        <p>Metacritic: {game.metacriticScore}%</p>
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
          }

            </>
          );
        })
      ) : (
        <div className="no-search-found">Sorry, no games found</div>
      )}

      {(isInfinite || fetcher.state !== 'idle') && (
        <>
        <SkeletonCard />
        <div>More games coming your way...</div>
        </>
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
