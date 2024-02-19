import { json, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { GeneralErrorBoundary } from '~/components/error-boundary';

// look at data mutations
export const meta: MetaFunction = () => {
  return [{ title: 'Home' }, { name: 'description', content: 'Homepage' }];
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
  const gamesList = await fetch(
    'https://www.cheapshark.com/api/1.0/deals',
    requestOptions
  );
  return json(await gamesList.json());
}

export default function HomeRoute() {
  const listOfDeals = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Home</h1>
      {listOfDeals.map((game: dealsList, index: number) => (
        <div key={index}>
          <pre className="flex flex-col ">{JSON.stringify(game)}</pre>
        </div>
      ))}
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <p>No user with the username {params.user} exists</p>
        ),
      }}
    />
  );
}
