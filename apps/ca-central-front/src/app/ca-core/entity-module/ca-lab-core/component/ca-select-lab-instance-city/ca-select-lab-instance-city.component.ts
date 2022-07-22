import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {CaCountry} from '../../../../model/entities/ca-country.entity';
import {CaCountryService} from '../../../../service-api/ca-country.service';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'ca-select-lab-instance-city',
  templateUrl: './ca-select-lab-instance-city.component.html',
  styleUrls: ['./ca-select-lab-instance-city.component.scss']
})
export class CaSelectLabInstanceCityComponent extends FlEmbeddedOptionsAbstractDirective implements OnInit, AfterViewInit {

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
