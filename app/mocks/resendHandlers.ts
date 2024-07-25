// import { http, HttpHandler, HttpResponse } from 'msw';
// import { z } from 'zod';
// import { faker } from '@faker-js/faker';

// const emailSchema = z.object({
//   from: z.string(),
//   to: z.string(),
//   subject: z.string(),
//   html: z.string(),
//   text: z.string(),
//   // createdAt: z.date(),
// });

// export const resendHandlers: Array<HttpHandler> = [
//   // Intercepts https://api.resend.com/emails" requests
//   http.post('https://api.resend.com/emails', async ({ request }) => {
//     const body = emailSchema.parse(await request.json());
//     console.log('mocked email content: ', body);
//     // Respond to the post request  using this JSON response.
//     return HttpResponse.json({
//       id: faker.string.uuid(),
//       from: body.from,
//       to: body.to,
//       createdAt: new Date().toISOString(),
//     });
//   }),
// ];
