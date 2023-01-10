import {TdTypingName} from '../model/td-typing-name.class';

export interface TdTechnicalDocUrl{
  isAbsolute: boolean;
  url: string;
}


export abstract class TdServiceConfig {
  /**
   * Get the unique technical documentation url
   * Result can be contain an absolute  link or not
   */
  public abstract getTechnicalDocUrl(
    parentVersion: string,
    typingName: TdTypingName): TdTechnicalDocUrl; // boolean = isAbsolute ; string = link
}
