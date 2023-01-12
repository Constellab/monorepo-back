import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {CaCountry} from '../../../../model/entities/ca-country.entity';
import {CaCountryService} from '../../../../service-api/ca-country.service';
import {MatLegacySelect as MatSelect} from '@angular/material/legacy-select';

@Component({
  selector: 'ca-select-city-options',
  templateUrl: './ca-select-options-city.component.html',
  styleUrls: ['./ca-select-options-city.component.scss']
})
export class CaSelectOptionsCityComponent extends FlEmbeddedOptionsAbstractDirective implements OnInit, AfterViewInit {

  countries: CaCountry[];

  isLoading: boolean = false;

  constructor(private countryService: CaCountryService,
              @Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.getCountries();
  }

  private getCountries(): void {
    this.isLoading = true;
    this.countryService.get().subscribe(
      countries => this.getCountriesSuccess(countries),
      () => this.isLoading = false
    );
  }

  private getCountriesSuccess(countries: CaCountry[]): void {
    this.isLoading = false;
    this.countries = countries;
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

}
