import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const listOfGames: string[] = [];
const userGameRating: string[] = [
  'Not worth it',
  'Worth it on sale',
  'Worth it full price',
];

function getRandArrayIndex(array: string[]) {
  return Math.floor(Math.random() * array.length);
}

async function fetchGameData() {
  try {
    const api = await fetch(
      'https://www.cheapshark.com/api/1.0/games?title=a',
      {
        method: 'GET',
      }
    );
    if (!api.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await api.json();
    data.forEach((game: any) => {
      listOfGames.push(game.gameID);
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function createGamePost(gameId: string) {
  return {
    gameId: gameId,
    favouritedBy: {},
    userGameRating: {},
    comments: {},
  };
}

function createUser() {
  const randFirstname = faker.person.firstName();
  const randLastname = faker.person.lastName();
  const randUsername = faker.internet.userName({
    firstName: randFirstname.toLowerCase(),
    lastName: randLastname.toLowerCase(),
  });
  return {
    username: randUsername,
    firstname: randFirstname,
    lastname: randLastname,
    email: `${randUsername}@domain.com`,
    // comments: {},
    likedComments: {},
    // gameRatings: {},
    gameFavourites: {},
    // image: {},
  };
}

async function seed() {
  await prisma.user.deleteMany();
  await prisma.gamePost.deleteMany();

  // Custom DATA
  // ADD CUSTOM DATA
  // ------------------
  // Faker generated
  const totalUsers = 15;
  console.time(`Created ${totalUsers} users`);
  const totalGamePosts = listOfGames.length;
  console.time(`Created ${totalGamePosts} gamePosts`);

  const listOfGamePosts: any = [];
  await fetchGameData(); // Add list of gameIds to listOfGames
  for (let index = 0; index < listOfGames.length; index++) {
    const gameId = listOfGames[index];

    const gamePostRecord = await prisma.gamePost.create({
      data: {
        ...createGamePost(gameId),
      },
    });
    listOfGamePosts.push(gamePostRecord.id);
  }
  console.timeEnd(`Created ${totalGamePosts} users`);

  const randSentence = faker.lorem.sentence();
  const randParagraph = faker.lorem.paragraph();
  const randImage = faker.image.avatar();

  for (let index = 0; index < totalUsers; index++) {
    await prisma.user.create({
      data: {
        ...createUser(),

        comments: {
          // randomize length of array for number of comments (0-4 per user)
          create: [
            {
              content: randParagraph || randSentence,
              likes: 0,
              childComments: {},
              likedBy: {},
              // userId: user.id,
              gamePostId: listOfGamePosts[getRandArrayIndex(listOfGamePosts)],
              // parentCommentId: '',
            },
          ],
        },
        gameRatings: {
          // randomize number of ratings like done for comments
          create: [
            {
              name: userGameRating[getRandArrayIndex(userGameRating)],
              gamePostId: listOfGamePosts[getRandArrayIndex(listOfGamePosts)],
            },
          ],
        },
        // gameFavourites: {
        //   // randomize number of ratings like done for comments
        //   connect:
        // },
        image: {
          create: {
            altText: randSentence,
            contentType: '',
            blob: randImage,
          },
        },
      },
    });
  }
  console.timeEnd(`Created ${totalUsers} users`);
}

seed();
