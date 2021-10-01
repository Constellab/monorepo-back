import {CorsOptions} from '@nestjs/common/interfaces/external/cors-options.interface';

export function blGetCorsConfig(domain: string, isLocal: boolean): CorsOptions {

  let origin: (RegExp | string)[];
  if (isLocal) {
    origin = [/^(.*)/];
  } else {
    origin = [new RegExp(`https://*\\.${domain.replace('.', './')}`), 'http://localhost:4200'];
  }
  return {
    origin: origin, // use regex instead of simple '*'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    // header If-None-Match useful for Safari with service workers
    allowedHeaders:
      'Origin,X-Requested-With,Content-Type,Accept,Authorization,authorization,X-Forwarded-for,lang,If-None-Match',
  };
}

