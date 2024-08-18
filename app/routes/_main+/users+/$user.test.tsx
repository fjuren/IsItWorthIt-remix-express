/**
 * @vitest-environment jsdom
 */

import { faker } from '@faker-js/faker';
import { expect, test } from 'vitest';
import { createRemixStub } from '@remix-run/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { default as UsernameRoute, loader as userLoader } from './$user';
import { default as AppWithProviders, loader as rootLoader } from '~/root';
import { json } from '@remix-run/node';
import { honeypot } from '~/utils/honeypot.server';

function createTestUser() {
  const user = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    username: faker.internet.userName(),
    createdAt: faker.date.past(),
    image: {
      id: faker.string.uuid(),
    },
  };
  return user;
}

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

  // screen.logTestingPlaygroundURL();
  // checks some expected fields and text
  await waitFor(() => screen.findByText('Profile'));
  await screen.findByRole('heading', { name: `Name: ${user.name}` });
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
  screen.logTestingPlaygroundURL();

  // Wait for and then assert on the heading
  const heading = await screen.findByRole('heading', {
    name: `Name: ${user.name}`,
  });
  expect(heading);

  // Assert that the email link is in the document
  const emailLink = await screen.findByRole('link', { name: /email/i });
  expect(emailLink);
});
