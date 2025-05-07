import { z } from 'zod';
import {
  codeSearchParams,
  targetSearchParams,
  typeSearchParams,
} from './constants';

// Variables
const usernameMaxLength: number = 20;
const minLength: number = 3;
const passwordMaxLength: number = 100;
const emailMaxLength: number = 100;

export const UsernameSchema = z
  .string({ required_error: 'Please enter your username' })
  .min(minLength, { message: 'Username is too short' })
  .max(usernameMaxLength, {
    message: 'Must be 20 or fewer characters long',
  });

export const EmailSchema = z
  .string({ required_error: 'Please enter your email address' })
  .min(minLength, { message: 'Email is too short' })
  .max(emailMaxLength, { message: 'Email is too long' })
  .email({
    message: 'Please enter a valid email address',
  });

export const PasswordSchema = // TODO improve security requirement validation for passwords
  z
    .string({ required_error: 'Please enter your password' })
    .min(minLength, { message: 'Password is too short' })
    .max(passwordMaxLength, {
      message: 'Must be 100 or fewer characters long',
    });

export const ConfirmSchema = z
  .string({ required_error: 'Please confirm your password' })
  .max(passwordMaxLength, {
    message: 'Must be 100 or fewer characters long',
  });

export const twoFaSchema = z
  .string()
  .min(8, { message: 'Two-factor code must be 8 characters long' })
  .max(8, { message: 'Two-factor code must be 8 characters long' })
  .optional();

export const ResetPWSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: ConfirmSchema,
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: "Passwords don't match",
      });
    }
  });

export const verifySchema = z.object({
  [codeSearchParams]: z.string({
    required_error: 'Please enter your code. It was sent to your email address',
  }),
  [targetSearchParams]: z.string(),
  [typeSearchParams]: z.string(),
  redirectTo: z.string().optional(),
});

export const SearchSchema = z.object({
  gameTitle: z.string({ required_error: 'Please enter a game title' }),
});

export const GameFilterSchema = z.object({
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  saleOnly: z.array(z.string()).default([]),
  recentSales: z.array(z.string()).optional(),
  steamworks: z.array(z.string()).default([]),
  storeID: z.array(z.string()).default([]),
});
