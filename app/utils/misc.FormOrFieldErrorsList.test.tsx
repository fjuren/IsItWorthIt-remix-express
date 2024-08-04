/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { FormOrFieldErrorsList } from './misc';
import { faker } from '@faker-js/faker';

test('Render the error list with no errors', async () => {
  render(<FormOrFieldErrorsList />);
  //   screen.debug();
  const errors = screen.queryAllByRole('listitem');
  expect(errors).toHaveLength(0);
});

test('show a single error', async () => {
  const data = faker.lorem.words(4);
  render(<FormOrFieldErrorsList data={[data]} />);
  const errors = screen.queryAllByRole('listitem');
  expect(errors).toHaveLength(1);
});

test('show multiple errors', async () => {
  const data1 = faker.lorem.words(4);
  const data2 = faker.lorem.words(4);
  render(<FormOrFieldErrorsList data={[data1, data2]} />);
  //   screen.debug();
  const errors = screen.queryAllByRole('listitem');
  expect(errors).toHaveLength(2);
  //   screen.logTestingPlaygroundURL();
});

test('takes false values', async () => {
  const data1 = faker.lorem.words(3);
  render(<FormOrFieldErrorsList data={[data1, undefined, null]} />);
  const errors = screen.getAllByRole('listitem');
  const errorsThatShow = errors.filter(Boolean);
  //   errorsThatShow.map((error, index) => {
  //     console.log(`Error ${index + 1}:`, error.textContent);
  //   });
  expect(errors).toHaveLength(errorsThatShow.length);
  expect(errors.map((e) => e.textContent)).toEqual(
    errorsThatShow.map((e) => e.textContent)
  );
  //   screen.logTestingPlaygroundURL();
});

test('adds id to the ul', async () => {
  const id = faker.lorem.word();
  const data = faker.lorem.words(4);
  render(<FormOrFieldErrorsList data={[data]} errorID={id} />);
  //   screen.debug();
  const errorId = screen.getByRole('list');
  expect(errorId.getAttribute('id')).toBe(id);
});
