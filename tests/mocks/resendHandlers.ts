import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { faker } from '@faker-js/faker';
import fsExtra from 'fs-extra';
import { HttpResponse, http, type HttpHandler } from 'msw';
import { z } from 'zod';

const emailSchema = z.object({
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  html: z.string(),
  text: z.string(),
  // createdAt: z.date(),
});
// writing to disk here. This is so that I can get the email from my file system
const handlerDirName = path.dirname(fileURLToPath(import.meta.url));

const handlerEmailFixturesDirPath = path.join(
  handlerDirName,
  '..',
  'tests', // BUG need to indicate 'tests' below. handlerEmailFixturesDirPath in the resend handler seems to start in a different directory. 'resultingHandlerEmailFixturesDirPath' was created for when the email needs to be read from the file system
  'fixtures',
  'email'
);

const resultingHandlerEmailFixturesDirPath = path.join(
  handlerDirName,
  '..',
  'fixtures',
  'email'
);

export async function requireMockEmail({
  emailAddress,
}: {
  emailAddress: string;
}) {
  const email = await fsExtra.readJSON(
    path.join(resultingHandlerEmailFixturesDirPath, `${emailAddress}.json`)
  );

  return emailSchema.parse(email);
}

export const resendHandlers: Array<HttpHandler> = [
  http.post('https://api.resend.com/emails', async ({ request }) => {
    const body = emailSchema.parse(await request.json());
    console.info('🔶 mocked email contents:', body);

    await fsExtra.writeJSON(
      path.join(handlerEmailFixturesDirPath, `./${body.to}.json`),
      body
    );

    return HttpResponse.json({
      id: faker.string.uuid(),
      from: body.from,
      to: body.to,
      createdAt: new Date().toISOString(),
    });
  }),
];
