import { LoaderFunctionArgs, MetaFunction, useLoaderData } from 'react-router';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { gameLookupResponse } from '~/types/gameLookup';
import { invariantResponse } from '~/utils/misc';
// import { useOptionalUser } from '~/utils/user';

const requestOptions = {
  method: 'GET',
};

export const meta: MetaFunction<typeof loader> = () => {

    return [
      { title: `Game Details | IsItWorthIt?` },
      {
        name: 'description',
        content: `Game details, including price, `,
      },
    ];
  };

  export async function loader({ params }: LoaderFunctionArgs) {

    const gameData = await fetch(
      `https://www.cheapshark.com/api/1.0/games?id=${params.gameID}`,
      requestOptions
    )
    const gameDataJson: gameLookupResponse = await gameData.json();
  
    // throw new Error('Component error');
    invariantResponse(gameDataJson, `Game information not found`, { status: 404 });
    return { gameDataJson };
  }

  export default function UsernameRoute() {
    const data = useLoaderData<typeof loader>();
    // const loggedInUser = useOptionalUser();
    // const isLoggedInUser = loggedInUser?.id === data.user.id;
    return (
      <div>
        <div>
          <img src={data.gameDataJson.info.thumb} alt="Game"/>
          <div>{data.gameDataJson.info.title}</div>
          <div>{data.gameDataJson.cheapestPriceEver.price}</div>
          <div>{data.gameDataJson.cheapestPriceEver.date}</div>
        </div>

      </div>
    );
  }


  export function ErrorBoundary() {
    return (
      <GeneralErrorBoundary
        defaultStatusHandler={({ error }) => (
          <p>
            Default Error Handler: {error.status} - {error.data}
          </p>
        )}
        statusHandlers={{
          404: ({ error, params }) => (
            <p>
              {error.status}: No user with the username {params.user} exists
            </p>
          ),
        }}
      />
    );
  }