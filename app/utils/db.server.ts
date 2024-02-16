import crypto from 'crypto';
import { factory, manyOf, nullable, oneOf, primaryKey } from '@mswjs/data';
import { singleton } from './singleton.server';

const getId = () => crypto.randomBytes(16).toString('hex').slice(0, 8);

export const db = singleton('db', () => {
  const db = factory({
    user: {
      id: primaryKey(getId),
      email: String,
      username: String,
      name: nullable(String),

      createdAt: () => new Date(),

      comments: manyOf('comment'),
    },
    comment: {
      id: primaryKey(getId),
      content: String,

      createdAt: () => new Date(),

      owner: oneOf('user'),
    },
  });

  const john = db.user.create({
    id: '9d6eba59daa2fc2078cf8205cd451041',
    email: 'johndoe@gmail.com',
    username: 'johndoe',
    name: 'John Doe',
  });

  const comments = [
    {
      id: 'd27a197e',
      content: 'Great idea!',
    },
    {
      id: '414f0c09',
      content: 'Haha so funny',
    },
    {
      id: '260366b1',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas suscipit condimentum blandit. Maecenas risus ex, tempus eget tellus sit amet, fermentum varius justo. Integer ornare leo non libero fermentum finibus. Maecenas rhoncus consequat urna, id mollis massa ultrices vitae. Fusce gravida mi justo, a porttitor nibh suscipit sed. Aenean vel venenatis ipsum, nec condimentum metus. Sed pulvinar metus consectetur, egestas velit sit amet, porttitor sapien. Curabitur sed magna massa. ',
    },
    {
      id: 'bb79cf45',
      content: 'Such a great game! Giving it 5 stars',
    },
  ];

  for (const comment of comments) {
    db.comment.create({
      ...comment,
      owner: john,
    });
  }

  return db;
});
