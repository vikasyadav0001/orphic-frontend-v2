import { Scalekit } from '@scalekit-sdk/node';

const envUrl = process.env.SCALEKIT_ENV_URL || 'https://placeholder.scalekit.com';
const clientId = process.env.SCALEKIT_CLIENT_ID || 'placeholder_client_id';
const clientSecret = process.env.SCALEKIT_CLIENT_SECRET || 'placeholder_client_secret';

export const scalekit = new Scalekit(
  envUrl,
  clientId,
  clientSecret
);
