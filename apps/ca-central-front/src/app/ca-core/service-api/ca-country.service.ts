import {Injectable} from '@angular/core';
import {FlApiService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {CaCountry} from '../model/entities/ca-country.entity';

@Injectable({
  providedIn: 'root'
})
export class CaCountryService {

  private readonly route = 'country';

  constructor(private apiService: FlApiService) {
  }

  public get(): Observable<CaCountry[]> {
    return this.apiService.get(`${this.route}`, CaCountry);
  }

}
