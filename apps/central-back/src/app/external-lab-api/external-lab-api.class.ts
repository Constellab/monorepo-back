/**
 * Basic response type of the Lab API
 * The request can return a 200 but still the status is false --> error
 */
export interface ExternalLabApiResponse<T = any> {
  status: boolean; // true if success, false if not
  response: T;
}


/**
 * Response when logged in a user to the lab instance
 */
export interface ExternalLabLoginResponse {
  access_token: string;
  token_type: string;
}


/**
 * Object format of the experiment in the lab
 */
export interface ExternalExperimentClass {
  uri: string;
  protocol: {
    uri: string,
    graph: string
  };
}
