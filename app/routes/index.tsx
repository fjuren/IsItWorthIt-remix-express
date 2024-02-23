import { json, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { SideNav } from '~/components/UI/SideNav';

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

// const requestOptions = {
//   method: 'GET',
// };

// export async function loader() {
//   const gamesList = await fetch(
//     'https://www.cheapshark.com/api/1.0/deals',
//     requestOptions
//   );
//   return json(await gamesList.json());
// }

export default function HomeRoute() {
  // throw new Response('Not found', { status: 500 });
  // const listOfDeals = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex h-full">
        <SideNav />
        <main className="flex flex-col w-full h-full">
          <h1>Home</h1>
          {/* {listOfDeals.map((game: dealsList, index: number) => (
            <div key={index}>
              <pre className="flex flex-col ">{JSON.stringify(game)}</pre>
            </div>
          ))} */}
        </main>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          // {
          // params
          // }
          <p>Page does not exist</p>
        ),
        500: () => <p>Sorry, something went wrong! Try again later.</p>,
      }}
    />
  );
}
