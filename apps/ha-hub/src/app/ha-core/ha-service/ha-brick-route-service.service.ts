import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HaBrickRouteService {

  constructor() { }

  public static getTecDocUrl(parentBrickName:string, parentVersion:string, objectType:string, docParentUniqueName:string): string{
    return `/bricks/${parentBrickName}/${parentVersion}/doc/technical-folder/${objectType}/${docParentUniqueName}`;
  }
}
