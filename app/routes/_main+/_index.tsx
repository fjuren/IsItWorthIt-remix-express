import { MetaFunction } from 'react-router';
import { useLoaderData, useOutletContext, Link } from 'react-router-dom';
import { BookmarkIcon } from 'lucide-react';
import CommentIcon from '~/assets/svgs/CommentIcon';
import DownvoteIcon from '~/assets/svgs/DownvoteIcon';
import UpvoteIcon from '~/assets/svgs/UpvoteIcon';
import { Badge } from '~/components/UI/Badge';
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

interface dealsList {
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

interface storeList {
  storeID: string;
  storeName: string;
  isActive: number;
  images: {
    banner: string;
    logo: string;
    icon: string
  }
}

const requestOptions = {
  method: 'GET',
};

export async function loader() {
  // throw new Response('Not found', { status: 500 });
  const gamesList = await fetch(
    'https://www.cheapshark.com/api/1.0/deals?pageSize=30',
    requestOptions
  )
  const storeList = await fetch(
    'https://www.cheapshark.com/api/1.0/stores',
    requestOptions
  )
  const listOfDeals = await gamesList.json();
  const listOfStores = await storeList.json();

  return { listOfDeals, listOfStores };
}

function formatPercentage(value: string) {
  return `${Math.round(parseFloat(value))}%`
}

export default function HomeRoute() {
  const {listOfDeals, listOfStores} = useLoaderData<typeof loader>();
  console.log(listOfDeals)
  const theme: string = useOutletContext();
  return (
    <>
    {listOfDeals.map((game: dealsList, index: number) =>
      <GameCard key={index}>
          <GameCardImage src={game.thumb} alt={`${game.title} image`}>
          </GameCardImage>
        <GameCardHeader>
          <GameCardTitle>{game.title}</GameCardTitle>
          <GameCardDescription>
          <img className='' src={`https://www.cheapshark.com${listOfStores.find((o: storeList) => o.storeID === game.storeID)["images"]["icon"]}`} alt={`${listOfStores.find((o: storeList) => o.storeID === game.storeID)["storeName"]}'s logo`} />
          <p>{listOfStores.find((o: storeList) => o.storeID === game.storeID)["storeName"]}</p>
          </GameCardDescription>
          <GameCardSocial>
            likes dislikes comments wishlists
          </GameCardSocial>
        </GameCardHeader>
        <GameCardContent1>
          <p className='line-through text-slate-500 text-xs'>${game.normalPrice}</p>
           <p className='text-lg font-bold'>${game.salePrice} USD</p> 
           <Badge>-{formatPercentage(game.savings)}</Badge>
        </GameCardContent1>
        <GameCardContent2>
          <p>{game.steamRatingCount} votes</p>
          <p>{game.steamRatingPercent}%</p>
          <p>{game.steamRatingText} rating</p>
        </GameCardContent2>
        <GameCardContent3>
          <p>Deal rating: {game.dealRating}</p>
        </GameCardContent3>
        <GameCardContent4>
          <Button variant={'default'}  asChild>
            <Link to={`https://www.cheapshark.com/redirect?dealID=${game.dealID}`}>Store</Link>
          </Button>
          <Button variant={'outline'} onClick={() => {alert(`Detials page for ${game.title} not available yet. \nCome back again later!`)}}>
            <Link to=''>Details</Link></Button>
        </GameCardContent4>
      </GameCard>
    )}
      {/* {listOfDeals.map((game: dealsList, index: number) => (
        <Card
          // theme={theme}
          key={index}
          className={`flex-grow hover:cursor-pointer rounded-lg bg-card text-card-foreground shadow-sm flex flex-col w-full space-y-1.5 p-6 ${
            theme == 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-900'
          }`}
          onClick={() => console.log('card')}
        >
          <CardHeader>
            <div className="flex justify-center">
              <img
                src={game.thumb}
                alt={`${game.title}'s thumbnail`}
                className="w-4/7 md:w-1/4"
              />
            </div>
            <CardTitle>{game.title}</CardTitle>
            <CardDescription>
              Full price: ${game.normalPrice} Sale price: ${game.salePrice}{' '}
              Discount: <strong>{formatPercentage(game.savings)} off</strong>
            </CardDescription>
            <CardContent>{<p>Card Content</p>}</CardContent>
          </CardHeader>
          <CardFooter>
            <div className="flex flex-row">
              <div className="flex flex-row">
                <button
                  type="button"
                  aria-label="Upvote"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Upvote');
                  }}
                >
                  <UpvoteIcon />
                </button>
                <button
                  type="button"
                  aria-label="Downvote"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Downvote');
                  }}
                >
                  <DownvoteIcon />
                </button>
              </div>
              <button
                aria-label="Comment"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Comment');
                }}
              >
                <CommentIcon />
              </button>
              <button
                aria-label="Bookmark"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('bookmark');
                }}
              >
                <BookmarkIcon />
              </button>
            </div>
          </CardFooter>
        </Card>
      ))} */}
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
