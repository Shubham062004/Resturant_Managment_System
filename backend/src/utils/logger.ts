import { Logtail } from '@logtail/node';
import LogtailTransport from '@logtail/pino';
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

let logtailTransport;
if (isProduction && process.env.LOGTAIL_SOURCE_TOKEN) {
  const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
  logtailTransport = (LogtailTransport as any)(logtail);
}

const streams: any[] = [];
if (isProduction) {
  streams.push({ stream: process.stdout });
  if (logtailTransport) {
    streams.push(logtailTransport);
  }
}

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: { env: process.env.NODE_ENV },
  },
  isProduction
    ? pino.multistream(streams)
    : pino.transport({
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      })
);

export default logger;
