import { MetaFunction } from 'react-router';
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


const requestOptions = {
  method: 'GET',
};

export async function loader() {
  // throw new Response('Not found', { status: 500 });
  const gamesList = await fetch(
    'https://www.cheapshark.com/api/1.0/deals?pageSize=30',
    requestOptions
  );
  const storeList = await fetch(
    'https://www.cheapshark.com/api/1.0/stores',
    requestOptions
  );
  const listOfDeals: Deals = await gamesList.json();
  const listOfStores: Stores = await storeList.json();

  return { listOfDeals, listOfStores };
}

function formatPercentage(value: string) {
  return `${Math.round(parseFloat(value))}%`;
}

export default function HomeRoute() {
  const { listOfDeals, listOfStores } = useLoaderData<typeof loader>();
  // const theme: string = useOutletContext(); TODO determine if I still need theme
  return (
    <>
      <h1 className="font-bold text-center text-4xl">
        Find games worth <br /> your while
      </h1>
      {listOfDeals.map((game: Deal, index: number) => (
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
                  listOfStores.find((o: Store) => o.storeID === game.storeID)?.[
                    'images'
                  ]['icon']
                }`}
                alt={`${
                  listOfStores.find((o: Store) => o.storeID === game.storeID)?.[
                    'storeName'
                  ]
                }'s logo`}
              />
              <p>
                {
                  listOfStores.find((o: Store) => o.storeID === game.storeID)?.[
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
          </GameCardContent2>
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
          </GameCardContent4> */}
        </GameCard>
      ))}
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
