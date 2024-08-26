import { json, MetaFunction } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
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
  return json(await gamesList.json());
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
            <Card theme={theme} key={index} className="flex-grow">
              {/* <a href={`${game.metacriticLink}`}> */}
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
                  Price: {game.normalPrice} Discount: {game.salePrice}{' '}
                  {game.savings}% off
                </CardDescription>
                <CardContent>{/* <p>Card Content</p> */}</CardContent>
              </CardHeader>
              <CardFooter></CardFooter>
              {/* </a> */}
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
