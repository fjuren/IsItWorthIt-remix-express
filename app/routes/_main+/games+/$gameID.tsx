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
  );
  const gameDataJson: gameLookupResponse = await gameData.json();

  // throw new Error('Component error');
  invariantResponse(gameDataJson, `Game information not found`, {
    status: 404,
  });
  return { gameDataJson };
}

export default function UsernameRoute() {
  const data = useLoaderData<typeof loader>();
  // const loggedInUser = useOptionalUser();
  // const isLoggedInUser = loggedInUser?.id === data.user.id;
  return (
    <div className="game-details">
      {/* Header Section */}
      <div className="game-header">
        {/* Full Title — title */}
        <h1>{data.gameDataJson.info.title}</h1>

        {/* Cover Image or Banner — thumb */}
        <div className="game-image">
          <img
            src={data.gameDataJson.info.thumb}
            alt={data.gameDataJson.info.title}
          />
        </div>
      </div>

      {/* Price Section */}
      <div className="price-section">
        {/* Current Price + Retail Price + % Off — price, retailPrice, savings */}
        <div className="current-price">
          <span className="price">
            ${data.gameDataJson.cheapestPriceEver.price}
          </span>
          {/* Add retail price and savings % when available */}
        </div>

        {/* Historical Price Info */}
        <div className="price-history">
          <span>Lowest ever: ${data.gameDataJson.cheapestPriceEver.price}</span>
          <span>
            on{' '}
            {new Date(
              data.gameDataJson.cheapestPriceEver.date * 1000
            ).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Store & Purchase Section */}
      <div className="store-section">
        {/* Store Details + Buy Button (CTA) — storeID, dealID */}
        <div className="store-info">
          <span>Store ID: {data.gameDataJson.deals[0]?.storeID}</span>
          {/* Replace with actual store name component */}
        </div>

        <div className="purchase-actions">
          {/* Buy Button - use dealID to construct purchase URL */}
          <button className="buy-button">BUY NOW</button>
        </div>
      </div>

      {/* User Actions */}
      <div className="user-actions">
        {/* Add to Wishlist / Set Price Alert — internal */}
        <button className="wishlist-button">Add to Wishlist</button>
        <button className="price-alert-button">Set Price Alert</button>
      </div>

      {/*
      // Game Info Section
      <div className="game-info">
        // Steam Rating / Metacritic Score — steamRating, metacritic
        <div className="ratings">
          {data.gameDataJson.info.steamRatingText && (
            <div className="steam-rating">
              <span>Steam: {data.gameDataJson.info.steamRatingText}</span>
              <span>({data.gameDataJson.info.steamRatingPercent}%)</span>
            </div>
          )}
          {data.gameDataJson.info.metacriticScore && (
            <div className="metacritic-score">
              <span>Metacritic: {data.gameDataJson.info.metacriticScore}</span>
            </div>
          )}
        </div>
        // SteamWorks / DRM Info — steamworks
        <div className="drm-info">
          <span>
            Steamworks: {data.gameDataJson.info.steamworks ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
*/}
      {/* Price History Graph Section */}
      <div className="price-history-section">
        {/* Price History Graph / Lowest Ever — deals array */}
        <h3>Price History</h3>
        <div className="price-chart-placeholder">
          {/* Chart component will go here */}
          <p>Price history chart placeholder</p>
        </div>
      </div>

      {/* Community Section */}
      <div className="community-section">
        {/* "Worth it?" Votes + Comments — internal */}
        <div className="worth-it-votes">
          <h3>Community Opinion</h3>
          <div className="vote-buttons">
            <button className="worth-it-yes">Worth It! 👍</button>
            <button className="worth-it-no">Not Worth It 👎</button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h3>Comments</h3>
          <div className="comments-placeholder">
            {/* Comments component will go here */}
            <p>Comments will be loaded here</p>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="additional-info">
        {/* Tags / Genres / Features — external or curated */}
        <div className="tags-section">
          <h3>Tags & Features</h3>
          <div className="tags-placeholder">
            {/* Tags component will go here */}
            <p>Game tags and features</p>
          </div>
        </div>

        {/* Description / Summary — external API */}
        <div className="description-section">
          <h3>Description</h3>
          <div className="description-placeholder">
            {/* Description component will go here */}
            <p>Game description will be loaded from external API</p>
          </div>
        </div>

        {/* Similar Games — external or curated */}
        <div className="similar-games-section">
          <h3>Similar Games</h3>
          <div className="similar-games-placeholder">
            {/* Similar games component will go here */}
            <p>Similar games recommendations</p>
          </div>
        </div>
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
