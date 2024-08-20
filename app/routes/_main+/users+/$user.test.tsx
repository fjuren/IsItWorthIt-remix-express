/**
 * @vitest-environment jsdom
 */

import { faker } from '@faker-js/faker';
import { describe, expect, test } from 'vitest';
import { createRemixStub } from '@remix-run/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { default as UsernameRoute, loader as userLoader, meta } from './$user';
import { default as AppWithProviders, loader as rootLoader } from '~/root';
import { json } from '@remix-run/node';
import { honeypot } from '~/utils/honeypot.server';
import { prisma } from '~/utils/db.server';
import { bcrypt } from '~/utils/auth.server';

function createTestUser() {
  const user = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    username: faker.internet.userName(),
    email: 'vitestuser@gmail.com',
    password: 'vitestuser1!',
    createdAt: faker.date.past(),
    image: {
      id: faker.string.uuid(),
    },
  };
  return user;
}

async function registerUser(userData: ReturnType<typeof createTestUser>) {
  await prisma.user.create({
    data: {
      email: userData.email,
      username: userData.username,
      password: {
        create: {
          hash: bcrypt.hashSync(userData.password, 10),
        },
      },
      roles: {
        connect: {
          name: 'user',
        },
      },
    },
  });
}

describe('User profile page', () => {
  test('visit /users/user (profile page) as a user visiting some other users profile page', async () => {
    const user = createTestUser();

    const RemixStub = createRemixStub([
      {
        path: '/users/:user',
        Component: UsernameRoute,
        loader(): Awaited<ReturnType<typeof userLoader>> {
          return json({
            user: {
              ...user,
              email: '',
              displayName: '',
              image: {
                blob: '',
                altText: '',
              },
            },
          });
        },
      },
    ]);
    await render(<RemixStub initialEntries={[`/users/${user.username}`]} />);

    // checks some expected fields and text
    await waitFor(() => screen.findByText('Profile'));
    await screen.findByRole('heading', { name: `Name: ${user.name}` });
    // screen.logTestingPlaygroundURL();
    // check that data doesn't exist
    expect(screen.queryByText(/email/i)).toBeNull();
    expect(screen.queryByText(/change your email/i)).toBeNull();
  });

  test('visit /settings/profile as the logged in user', async () => {
    const user = createTestUser();
    const RemixStub = createRemixStub([
      {
        id: 'root',
        path: '/',
        Component: AppWithProviders,
        loader(): Awaited<ReturnType<typeof rootLoader>> {
          const honeyProps = honeypot.getInputProps();
          return json({
            honeyProps,
            csrfToken: '',
            headers: 'light',
            toast: null,
            user,
          });
        },
        children: [
          {
            path: '/users/:user',
            Component: UsernameRoute,
            loader() {
              return json({
                user,
              });
            },
          },
        ],
      },
    ]);
    await render(<RemixStub initialEntries={[`/users/${user.username}`]} />);

    // Wait for the "Profile" text to appear
    await screen.findByText('Profile');

    // screen.logTestingPlaygroundURL();
    // Wait for and then assert on the heading
    const heading = await screen.findByRole('heading', {
      name: `Name: ${user.name}`,
    });
    expect(heading);

    // Assert that the email link is in the document
    const emailLink = await screen.findByRole('link', { name: /email/i });
    expect(emailLink);
  });

  test('Head <title> and <meta> elements display the correct text', async () => {
    const userData = createTestUser();
    await registerUser(userData);

    const UsernameRouteStub = createRemixStub([
      {
        id: 'root',
        path: '/',
        Component: AppWithProviders,
        loader(): Awaited<ReturnType<typeof rootLoader>> {
          const honeyProps = honeypot.getInputProps();
          return json({
            honeyProps,
            csrfToken: '',
            headers: 'light',
            toast: null,
            user: userData,
          });
        },
        children: [
          {
            path: '/users/:user',
            Component: UsernameRoute,
            loader: userLoader,
            meta: meta as any, //TODO monitor https://github.com/remix-run/remix/discussions/9344 for typing
          },
        ],
      },
    ]);
    await render(
      <UsernameRouteStub initialEntries={[`/users/${userData.username}`]} />
    );

    await waitFor(() => screen.findByText('Profile'));
    screen.logTestingPlaygroundURL();
    const titleElement = document.title;
    expect(titleElement).toBe(`${userData.username}'s profile`);

    const metacontent = document
      .querySelector('meta[name="description"]')
      ?.getAttribute('content');
    expect(metacontent).toBe(`${userData.username}'s profile page`);
  });
});
