import {
  Check,
  CheckCircle,
  ExternalLink,
  HeartPlus,
  MessageCircle,
  Share2,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import {
  Link,
  LoaderFunctionArgs,
  MetaFunction,
  useLoaderData,
} from 'react-router';
import { GeneralErrorBoundary } from '~/components/error-boundary';
import { DownvoteButton } from '~/components/Icons/Downvote';
import { UpvoteButton } from '~/components/Icons/UpvoteIcon';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/UI/Avatar';
import { Badge } from '~/components/UI/Badge';
import { Button } from '~/components/UI/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/UI/Card';
import { Separator } from '~/components/UI/Separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/UI/Tabs';
import { DealLookupResponse } from '~/types/dealLookup';
import { gameLookupResponse } from '~/types/gameLookup';
import { convertToMMYYYY, invariantResponse } from '~/utils/misc';
// import { useOptionalUser } from '~/utils/user';

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
  const dealLookupResponse = await fetch(
    `https://www.cheapshark.com/api/1.0/deals?id=${encodeURIComponent(
      params.dealId as string
    )}`,
    { method: 'GET' }
  );
  const gameLookupResponse = await fetch(
    `https://www.cheapshark.com/api/1.0/games?id=${params.gameId}`,
    { method: 'GET' }
  );
  const dealLookup: DealLookupResponse = await dealLookupResponse.json();
  const gameLookup: gameLookupResponse = await gameLookupResponse.json();

  invariantResponse(dealLookup, `Game information not found`, {
    status: 404,
  });
  return { dealLookup, gameLookup, dealId: params.dealId };
}

const mockComments = [
  {
    id: 1,
    user: 'GameMaster92 (username placeholder)',
    avatar: '',
    comment:
      'Absolutely incredible game! The world design is phenomenal and the boss fights are challenging but fair.',
    timestamp: '2 hours ago',
    likes: 12,
  },
  {
    id: 2,
    user: 'RPGFan2024 (username placeholder)',
    avatar: '',
    comment:
      'Worth every penny at this price. The amount of content is insane - easily 100+ hours of gameplay.',
    timestamp: '5 hours ago',
    likes: 8,
  },
];

export default function GameDetailsPage() {
  const { dealLookup, gameLookup, dealId } = useLoaderData<typeof loader>();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // const loggedInUser = useOptionalUser();
  // const isLoggedInUser = loggedInUser?.id === data.user.id;

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      // check if browser supports sharing natively
      await navigator.share({ url });
    } else {
      // if not copy to the clipboard
      await navigator.clipboard.writeText(url);
    }

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="pb-72">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          {/* hero */}
          <div className="relative h-64 flex items-center justify-center">
            <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
              <img
                src={dealLookup.gameInfo.thumb}
                alt={`${dealLookup.gameInfo.name}`}
                className="absolute inset-0 m-auto z-[1] object-contain h-[80%] w-[90%] overflow-hidden"
              />
              <img
                src={dealLookup.gameInfo.thumb}
                alt={`${dealLookup.gameInfo.name}`}
                className="absolute inset-0 m-auto h-[75%] w-[75%] overflow-hidden blur-sm"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4"
            >
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md"
              >
                {showSuccess ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </button>
            </Button>
          </div>

          <CardContent>
            {/* title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-3">
                {gameLookup.info.title}
              </h1>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">Action RPG (example)</Badge>
                <Badge variant="outline">Placeholder</Badge>
                <Badge variant="outline">Placeholder</Badge>
              </div>
            </div>

            {/* Price and Actions Row */}
            <div className="grid md:grid-rows-2 mb-6 gap-4">
              {/* Price Section */}
              <Card as={'section'}>
                <CardContent>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold">
                      ${dealLookup.gameInfo.salePrice} USD
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      ${dealLookup.gameInfo.retailPrice}
                    </span>
                    <Badge variant="destructive">
                      {/* dealLookup & gameLookup api endpoints do not include this; added manual % calculation for simplicity/fewer calls */}
                      {Math.round(
                        (1 -
                          Number(dealLookup.gameInfo.salePrice) /
                            Number(dealLookup.gameInfo.retailPrice)) *
                          100
                      )}{' '}
                      % OFF
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <TrendingUp className="h-4 w-4" />
                    <span>
                      Historic Low: ${gameLookup.cheapestPriceEver.price} on{' '}
                      {convertToMMYYYY(gameLookup.cheapestPriceEver.date)}
                    </span>
                  </div>
                  <Button className="w-full" size="lg">
                    <Link
                      to={`https://www.cheapshark.com/redirect?dealID=${dealId}`}
                    >
                      BUY NOW
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* wishlist & owned actions */}
              <Card as={'section'}>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-3">
                    <Button
                      variant={isWishlisted ? 'secondary' : 'outline'}
                      className="w-full justify-middle"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      <HeartPlus className="mr-2 h-4 w-4" />
                      {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
                    </Button>
                    <Button
                      variant={isOwned ? 'secondary' : 'outline'}
                      className="w-full justify-middle"
                      onClick={() => setIsOwned(!isOwned)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {isOwned ? 'Marked as Owned' : 'Mark as Owned'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* tabs */}
            <div className="w-full">
              <Tabs defaultValue="overview" className="md:w-[54rem]">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="worth-it">Worth It?</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="more">More</TabsTrigger>
                </TabsList>

                {/* store ratings / overview */}
                <TabsContent value="overview" className="mt-6">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* steam */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            Steam Rating
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-green-600">
                              {dealLookup.gameInfo.steamRatingPercent == '0'
                                ? 'n/a'
                                : `${dealLookup.gameInfo.steamRatingPercent}%`}
                            </span>
                            <span className="text-muted-foreground">
                              {dealLookup.gameInfo.steamRatingText == null
                                ? ''
                                : dealLookup.gameInfo.steamRatingText}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      {/* meta */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
                              M
                            </div>
                            Metacritic Score
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-green-600">
                              {dealLookup.gameInfo.metacriticScore == '0'
                                ? 'n/a'
                                : dealLookup.gameInfo.metacriticScore}
                            </span>
                            <span className="text-muted-foreground">
                              <Link
                                to={`https://www.metacritic.com${dealLookup.gameInfo.metacriticLink}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Click for Metacritic reviews
                              </Link>
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* description */}
                    <Card>
                      <CardHeader>
                        <CardTitle>About This Game</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          THE NEW FANTASY ACTION RPG. Lorem ipsum dolor sit
                          amet, consectetur adipiscing elit. Nullam volutpat
                          eros ut pharetra malesuada. Ut sollicitudin consequat
                          ullamcorper. Nunc mattis, libero ac fringilla
                          ullamcorper, orci purus ullamcorper dolor, sit amet
                          fringilla lectus erat non urna. Curabitur facilisis
                          ipsum posuere pellentesque imperdiet. Integer metus
                          leo, suscipit eget posuere nec, mollis in massa.
                          Pellentesque bibendum blandit venenatis. Ut at magna
                          pulvinar lorem congue pellentesque. Fusce blandit ex
                          iaculis sollicitudin accumsan. Aliquam eu auctor nunc.
                          Cras feugiat elementum ipsum, quis cursus nunc
                          facilisis ut. Sed risus lacus, molestie ac condimentum
                          sit amet, euismod id nunc. Morbi vestibulum massa in
                          massa scelerisque efficitur. Morbi suscipit convallis
                          lorem, commodo convallis urna cursus ut. In interdum
                          turpis ante, bibendum varius metus mattis vitae.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Key Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span>
                              Steamworks:{' '}
                              {dealLookup.gameInfo.steamworks ? 'Yes*' : 'No*'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span>
                              Single-player & Online Co-op (hardcoded
                              placeholder)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span>
                              Full Controller Support (hardcoded placeholder)
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* worth-it? */}
                <TabsContent value="worth-it" className="mt-6">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="text-center">
                        <CardTitle>
                          Is this game worth it at this price?
                        </CardTitle>
                        <CardDescription>
                          Share your opinion with the community
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
                          <Button
                            variant="outline"
                            className="flex-1 max-w-xs border-green-200 text-green-700 hover:bg-green-50 w-full"
                          >
                            <UpvoteButton className="mr-2 h-4 w-4" />
                            Worth It! (87%) (hardcoded)
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 max-w-xs border-red-200 text-red-700 hover:bg-red-50 w-full"
                          >
                            <DownvoteButton className="mr-2 h-4 w-4 rotate-180" />
                            Not Worth It (13%) (hardcoded)
                          </Button>
                        </div>
                        <p className="text-center text-muted-foreground text-sm">
                          Based on 1,234 community votes (hardcoded)
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* comments */}
                <TabsContent value="comments" className="mt-6">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Community Comments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {mockComments.map((comment, index) => (
                            <div key={comment.id}>
                              <div className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.avatar} />
                                  <AvatarFallback>
                                    {comment.user[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">
                                      {comment.user}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      {comment.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {comment.comment}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-muted-foreground"
                                  >
                                    <UpvoteButton className="mr-1 h-3 w-3" />
                                    {comment.likes}
                                  </Button>
                                </div>
                              </div>
                              {index < mockComments.length - 1 && (
                                <Separator className="mt-4" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* more */}
                <TabsContent value="more" className="mt-6">
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <Button
                            variant="ghost"
                            className="w-full justify-between h-auto p-4"
                          >
                            <span>Price History Chart</span>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <Button
                            variant="ghost"
                            className="w-full justify-between h-auto p-4"
                          >
                            <span>Similar Games</span>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <Button
                            variant="ghost"
                            className="w-full justify-between h-auto p-4"
                          >
                            <span>System Requirements</span>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
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
