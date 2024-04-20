import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

let listOfGames = [];

async function fetchGameData() {
  try {
    const api = await fetch(
      'https://www.cheapshark.com/api/1.0/deals?pageNumber=0',
      {
        method: 'GET',
      }
    );
    if (!api.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await api.json();
    console.log(data[0].internalName);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function main() {
  listOfGames = [];
  await fetchGameData();
  await prisma.user.deleteMany();
  await prisma.gamePost.deleteMany();

  // Custom users

  // Faker generated

  const randEmail = faker.internet.email();
  const randUsername = faker.internet.userName();
  const randFirstname = faker.person.firstName();
  const randLastname = faker.person.lastName();
  const randSentence = faker.lorem.sentence();
  const randParagraph = faker.lorem.paragraph();
  // const randImageUrl = faker.image.imageUrl();

  await prisma.gamePost.create({
    data: {
      id: 'clv1rxxek0000119a2w7l0783',
      gameId: 'HhzMJAgQYGZ%2B%2BFPpBG%2BRFcuUQZJO3KXvlnyYYGwGUfU%3D',
      favouritedBy: {},
      userGameRating: {},
      comments: {},
    },
  });

  const user = await prisma.user.create({
    data: {
      id: '1234',
      email: randEmail,
      username: randUsername,
      firstname: randFirstname,
      lastname: randLastname,
      comments: {},
      likedComments: {},
      gameRatings: {},
      gameFavourites: {},
      image: {},
    },
  });

  await prisma.comment.create({
    data: {
      content: randParagraph,
      likes: 0,
      childComments: {},
      likedBy: {},
      userId: user.id,
      gamePostId: 'clv1rxxek0000119a2w7l0783',
      // parentCommentId: '',
    },
  });

  await prisma.userGameRating.create({
    data: {
      name: randSentence,
      gamePostId: 'clv1rxxek0000119a2w7l0783',
      userId: user.id,
    },
  });
}

fetchGameData();
// main();
