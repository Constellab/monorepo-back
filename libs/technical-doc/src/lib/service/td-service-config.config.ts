export interface TdTechnicalDocUrl{
  isAbsolute: boolean;
  url: string;
}


/**
 * Service to provide to configure {@link TdService}
 */
export abstract class TdServiceConfig {
  /**
   * The technical documentation url
   */
  public abstract getTechnicalDocUrl(
    parentBrickName: string,
    parentVersion: string,
    objectType: string,
    docParentUniqueName: string): TdTechnicalDocUrl; // boolean = isAbsolute ; string = link
}
