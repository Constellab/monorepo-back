import {Component, Input, OnInit} from '@angular/core';
import {CaCity} from '../../../../model/entities/ca-city.entity';

@Component({
  selector: 'ca-lab-instance-city',
  templateUrl: './ca-lab-instance-city.component.html',
  styleUrls: ['./ca-lab-instance-city.component.scss']
})
export class CaLabInstanceCityComponent implements OnInit {

  @Input()
  city: CaCity;

  constructor() {
  }

  ngOnInit(): void {
  }

}
