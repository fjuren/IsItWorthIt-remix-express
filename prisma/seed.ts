import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  await prisma.gamePost.deleteMany();

  // Custom users

  // Faker generated

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
      // id: '1234',
      email: 'SallySmith@gmail.com',
      username: 'foxy_cleo',
      firstname: 'Sally',
      lastname: 'Smith',
      comments: {},
      likedComments: {},
      gameRatings: {},
      gameFavourites: {},
      image: {},
    },
  });

  await prisma.comment.create({
    data: {
      content: 'This game is wicked! Recommend getting this at full price :)',
      likes: 1,
      childComments: {},
      likedBy: {},
      userId: user.id,
      gamePostId: 'clv1rxxek0000119a2w7l0783',
      // parentCommentId: '',
    },
  });

  await prisma.userGameRating.create({
    data: {
      name: 'Worth it',
      gamePostId: 'clv1rxxek0000119a2w7l0783',
      userId: user.id,
    },
  });
}

main();
