import { json, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
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
    'https://www.cheapshark.com/api/1.0/deals',
    requestOptions
  );
  return json(await gamesList.json());
}

export default function HomeRoute() {
  const listOfDeals = useLoaderData<typeof loader>();
  return (
    <>
      <h1>Home</h1>
      <div className="grid grid-cols-1 md:grid-cols-3">
        {listOfDeals.map((game: dealsList, index: number) => (
          <Card key={index}>
            <CardHeader>
              <img src={game.thumb} alt="" />
              <CardTitle>{game.title}</CardTitle>
              <CardDescription>
                Price: {game.normalPrice} Discount: {game.salePrice}{' '}
                {game.savings}% off
              </CardDescription>
              <CardContent>{/* <p>Card Content</p> */}</CardContent>
            </CardHeader>
            <CardFooter></CardFooter>
          </Card>
          // {/* <pre className="flex flex-col ">{JSON.stringify(game)}</pre> */}
        ))}
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
