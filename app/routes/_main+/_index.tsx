import { MetaFunction } from 'react-router';
import { useLoaderData, useOutletContext } from 'react-router-dom';
import { BookmarkIcon } from 'lucide-react';
import CommentIcon from '~/assets/svgs/CommentIcon';
import DownvoteIcon from '~/assets/svgs/DownvoteIcon';
import UpvoteIcon from '~/assets/svgs/UpvoteIcon';
import { GeneralErrorBoundary } from '~/components/error-boundary';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/UI/Card';

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

const requestOptions = {
  method: 'GET',
};

export async function loader() {
  // throw new Response('Not found', { status: 500 });
  const gamesList = await fetch(
    'https://www.cheapshark.com/api/1.0/deals?pageNumber=0',
    requestOptions
  );
  return await gamesList.json();
}

function formatPercentage(value: string) {
  return Math.round(parseFloat(value)) + '%';
}

export default function HomeRoute() {
  const listOfDeals = useLoaderData<typeof loader>();
  const theme: string = useOutletContext();
  return (
    <>
      {/* <h1>Home</h1> */}
      <div className="flex flex-wrap max-w-[46rem]">
        <div className="flex flex-col gap-6">
          {listOfDeals.map((game: dealsList, index: number) => (
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
                  Discount:{' '}
                  <strong>{formatPercentage(game.savings)} off</strong>
                </CardDescription>
                <CardContent>{/* <p>Card Content</p> */}</CardContent>
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
          ))}
        </div>
      </div>
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
