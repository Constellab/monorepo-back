import {ClDeserializationRef, ClPageI} from '@monorepo/core-lib';

/**
 * Service to provide to configure {@link FlApiService}
 */
export abstract class FlApiServiceConfig {


  /**
   * Method call before each API call to append header to the request
   * (useful to happen authorization header)
   */
  public abstract getHeaders(): Record<string, string>;

  /**
   * The api url used by the app. Every call will use this URL
   */
  public abstract getApiUrl(): string;

  /**
   * Name of the query param page for the page number
   */
  public abstract get pageQueryParam(): string;

  /**
   * Name of the query param for the page size
   */
  public abstract get pageSizeQueryParam(): string;


  /**
   * Method to deserialize page
   * @param json returned json form the api
   * @param classReference for deserialization
   */
  public abstract deserializePage(json: any, classReference: ClDeserializationRef): ClPageI<any>;
}
