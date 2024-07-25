import { setupServer } from 'msw/node';
import { resendHandlers } from './resendHandlers';

export const server = setupServer(...resendHandlers);
