import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function blGetCorsConfig(
  domains: string[],
  isLocal: boolean,
  additionalAllowedHeader: string[] = []
): CorsOptions {
  let origin: (RegExp | string)[];
  if (isLocal) {
    origin = [/^(.*)/];
  } else {
    // convert the domains to regex
    const originRegex = domains.map((domain) => new RegExp(`https:\\/\\/.*\\.${domain.replace('.', '\\.')}`));
    const exactOrigin = domains.map((domain) => new RegExp(`https:\\/\\/${domain.replace('.', '\\.')}`));
    origin = [...originRegex, ...exactOrigin, 'http://localhost:4200', 'http://localhost:4000'];
  }

  return {
    origin: origin, // use regex instead of simple '*'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    // header If-None-Match useful for Safari with service workers
    allowedHeaders:
      'Origin,X-Requested-With,Content-Type,Accept,Authorization,authorization,' +
      'X-Forwarded-for,lang,If-None-Match' +
      (additionalAllowedHeader.length > 0 ? ',' + additionalAllowedHeader.join(',') : ''),
  };
}
