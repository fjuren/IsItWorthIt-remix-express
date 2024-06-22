import { z } from 'zod';

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

export const twoFaScema = z
  .string()
  .min(8, { message: 'Two-factor code must be 8 characters long' })
  .max(8, { message: 'Two-factor code must be 8 characters long' })
  .optional();
