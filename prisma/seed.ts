import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
// @ts-expect-error no real solution found. Running this file using "npx prisma db seed" runs the seed successfully regardless of this error
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const listOfGames: any[] = []; // games from cheapshark
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
      listOfGames.push(game);
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
    password: {
      create: createPassword(randUsername), // pw is same as the username for easy testing
    },
    // comments: {},
    likedComments: {},
    // gameRatings: {},
    // gameFavourites: {},
    // image: {},
  };
}

function createPassword(password: string) {
  const fakePassword = faker.internet.password();
  // defaults to a fake password
  return {
    hash: bcrypt.hashSync(password ? password : fakePassword, 10),
  };
}

async function seed() {
  await prisma.user.deleteMany();
  await prisma.gamePost.deleteMany();

  // Custom DATA

  const gamePost1 = await prisma.gamePost.create({
    data: {
      id: '2345bcde',
      gameId: '217162',
      // favouritedBy: {},
      // userGameRating: {},
      // comments: {},
    },
  });

  const user1 = await prisma.user.create({
    data: {
      id: '1234abcd',
      email: 'testuser1@gmail.com',
      username: 'testUser1',
      firstname: 'Test',
      lastname: 'User1',
      password: {
        create: {
          hash: bcrypt.hashSync('testuser1', 10),
        },
      },
      // comments: {},
      likedComments: {},
      // gameRatings: {},
      gameFavourites: {
        connect: [gamePost1],
      },
      image: {},
    },
  });

  const comment1 = await prisma.comment.create({
    data: {
      id: '4321dcba',
      content:
        "This game is so good! Here's a summary of what I thought: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam tincidunt tellus ut quam facilisis, non ornare massa rutrum. Duis vitae augue in nisi scelerisque sodales ut id enim. Fusce eget tellus volutpat, mollis quam sed, fringilla arcu. Morbi malesuada hendrerit ex, quis pretium felis viverra eu. Pellentesque eleifend nisi in pretium elementum. Proin semper, sem at pellentesque bibendum, quam ligula venenatis ante, non tristique tortor velit a massa. Vivamus mi neque, malesuada imperdiet libero tempor, lobortis dignissim nibh. Duis efficitur vehicula dapibus. Sed vestibulum, massa lacinia efficitur fringilla, arcu quam posuere magna, nec vestibulum lacus dui sed velit. Nam dapibus egestas massa ac tempus. Donec vitae mauris eget arcu vestibulum lacinia.",
      likes: 0,
      childComments: {},
      likedBy: {},
      userId: user1.id,
      gamePostId: gamePost1.id,
      // parentCommentId: '',
    },
  });

  await prisma.userGameRating.create({
    data: {
      id: '3456cdef',
      name: userGameRating[2],
      gamePostId: gamePost1.id,
      userId: user1.id,
    },
  });

  const gamePost2 = await prisma.gamePost.create({
    data: {
      id: '5432edcb',
      gameId: '96977',
      // favouritedBy: {},
      // userGameRating: {},
      // comments: {},
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: '6543fedc',
      email: 'schwarzenegger_weight_lifter@gmail.com',
      username: 'arnie',
      firstname: 'Arnold',
      lastname: 'Schwarzenegger',
      password: {
        create: {
          hash: bcrypt.hashSync('pizzashop', 10),
        },
      },
      // comments: {},
      likedComments: {},
      // gameRatings: {},
      gameFavourites: {
        connect: [gamePost1, gamePost2],
      },
      image: {},
    },
  });

  await prisma.comment.create({
    data: {
      id: '0987zyxw',
      content:
        'Oh my, this brings me back. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam tincidunt tellus ut quam facilisis, non ornare massa rutrum. Duis vitae augue in nisi scelerisque sodales ut id enim. Fusce eget tellus volutpat, mollis quam sed, fringilla arcu. Morbi malesuada hendrerit ex, quis pretium felis viverra eu. Pellentesque eleifend nisi in pretium elementum. Proin semper, sem at pellentesque bibendum, quam ligula venenatis ante, non tristique tortor velit a massa. Vivamus mi neque, malesuada imperdiet libero tempor, lobortis dignissim nibh. Duis efficitur vehicula dapibus. Sed vestibulum, massa lacinia efficitur fringilla, arcu quam posuere magna, nec vestibulum lacus dui sed velit. Nam dapibus egestas massa ac tempus. Donec vitae mauris eget arcu vestibulum lacinia.',
      likes: 1,
      childComments: {
        connect: [comment1],
      },
      likedBy: {
        connect: [user1],
      },
      userId: user2.id,
      gamePostId: gamePost2.id,
      // parentCommentId: '',
    },
  });

  await prisma.userGameRating.create({
    data: {
      id: 'wxyz1234',
      name: userGameRating[1],
      gamePostId: gamePost2.id,
      userId: user2.id,
    },
  });

  // --------------------------------------------------------------------------------------
  // // Faker generated
  const totalUsers = 20;
  console.time(`Created ${totalUsers} users`);
  const totalGamePosts = listOfGames.length;
  console.time(`Created ${totalGamePosts} gamePosts`);

  const listOfGamePosts: any = [];
  await fetchGameData(); // Add list of gameIds to listOfGames
  for (let index = 0; index < listOfGames.length; index++) {
    const game = listOfGames[index];

    const gamePostRecord = await prisma.gamePost.create({
      data: {
        ...createGamePost(game.gameID),
      },
    });
    listOfGamePosts.push(gamePostRecord);
  }
  console.timeEnd(`Created ${totalGamePosts} users`);

  const randSentence = faker.lorem.sentence();
  const randParagraph = faker.lorem.paragraph();
  const randImage = faker.image.avatar();
  const selectedGamePostIds = new Set();

  for (let index = 0; index < totalUsers; index++) {
    await prisma.user.create({
      data: {
        ...createUser(),
        comments: {
          // randomize length of array for number of comments (0-3 per user) and vary length of comments using faker
          create: Array.from({
            length: faker.number.int({ min: 0, max: 4 }),
          }).map(() => {
            return {
              content: Math.random() > 0.5 ? randSentence : randParagraph,
              likes: 0,
              childComments: {},
              likedBy: {},
              // userId: user.id,
              gamePostId:
                listOfGamePosts[getRandArrayIndex(listOfGamePosts)].id,
              // parentCommentId: '',
            };
          }),
        },
        gameRatings: {
          // randomize length of array for game ratings (2-4 per user)
          create: Array.from({
            length: faker.number.int({ min: 2, max: 4 }),
          }).map(() => {
            let selectedId;
            do {
              // Select a random gamePostId
              selectedId =
                listOfGamePosts[getRandArrayIndex(listOfGamePosts)].id;
            } while (selectedGamePostIds.has(selectedId)); // Check if it's already selected

            // Add the selected ID to the set
            selectedGamePostIds.add(selectedId);

            // Return the created gameRating object
            return {
              name: userGameRating[getRandArrayIndex(userGameRating)],
              gamePostId: selectedId,
            };
          }),
        },
        gameFavourites: {
          connect: [listOfGamePosts[getRandArrayIndex(listOfGamePosts)]],
        },
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
