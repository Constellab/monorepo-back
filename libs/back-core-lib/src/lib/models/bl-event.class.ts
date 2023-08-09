export type BlEventResponse<T = any> = BlEventResponseSuccess<T> | BlEventResponseError;

export interface BlEventResponseSuccess<T = any> {
  status: 'success';
  data: T;
}

export interface BlEventResponseError {
  status: 'error';
  error: string;
}

export class BlEventResponses {

  constructor(public responses: BlEventResponse[]) {
    console.log('responses', responses);
  }


  public hasError(): boolean {
    return this.responses.some(r => r.status === 'error');
  }

  public isSuccess(): boolean {
    return this.responses.every(r => r.status === 'success');
  }

  public getFirstError(): string{
    for(const r of this.responses){
      if(r.status === 'error'){
        return r.error;
      }
    }
    return null;
  }


}
