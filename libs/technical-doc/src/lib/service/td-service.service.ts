import { Injectable } from '@angular/core';
import {TdServiceConfig, TdTechnicalDocUrl} from './td-service-config.config';

@Injectable({
  providedIn: 'root'
})
export class TdService{

  constructor(
    private serviceConfig: TdServiceConfig
  ) { }

  public getTechnicalDocUrl(parentBrickName: string, parentVersion: string,
                            objectType: string, docParentUniqueName: string): TdTechnicalDocUrl {
    return this.serviceConfig.getTechnicalDocUrl(parentBrickName, parentVersion, objectType.toLowerCase(), docParentUniqueName);
  }
}
