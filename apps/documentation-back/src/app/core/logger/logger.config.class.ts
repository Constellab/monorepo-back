import {CoreConfigService} from '../modules/core-config/core-config.service';
import {format, transports} from 'winston';
import {WinstonModuleOptions} from 'nest-winston';
import {TransformableInfo} from 'logform';
import 'winston-daily-rotate-file';

/**
 * Method to configure the logger using winston
 *
 * In prod, it logs the in the console and in a daily file
 * @param configService
 */
export function configureLogger(configService: CoreConfigService): WinstonModuleOptions {

  const transportsList: any[] = [];

  const dataFormat: string = 'DD/MM/YY HH:mm:ss';
  const logFormat = (info: TransformableInfo): string => `${info.timestamp} ${info.level} [${info.context}]: ${info.message}`;

  // Add the console transport to log into the console
  transportsList.push(new transports.Console({
    level: configService.getLogLevel(),
    format: format.combine(
      format.timestamp({format: dataFormat}),
      format.colorize(),
      format.printf(logFormat)
    )
  }));

  // add the file transport to log into a file with rotation
  if (!configService.isLocal()) {
    // by default it create a new log file each day
    transportsList.push(new transports.DailyRotateFile({
      level: configService.getLogLevel(),
      dirname: configService.getLogPath(),
      filename: `%DATE%`, // filename is the current date YYYY-MM-DD
      extension: '.log',
      format: format.combine(
        format.timestamp({format: dataFormat}),
        format.printf(logFormat)
      ),
    }));
  }

  return {
    level: configService.getLogLevel(),
    transports: transportsList
  };
}
