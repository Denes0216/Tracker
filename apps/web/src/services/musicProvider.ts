import { ITunesProvider } from '@mgg/music';
import { browserHttpClient } from './httpClient';

/** Live iTunes search for the in-app deck builder (CORS is allowed). */
export const itunesProvider = new ITunesProvider(browserHttpClient);
