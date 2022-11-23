import {Component, Input, OnInit} from '@angular/core';
import {CaCity} from '../../../../model/entities/ca-city.entity';

@Component({
  selector: 'ca-city',
  templateUrl: './ca-city.component.html',
  styleUrls: ['./ca-city.component.scss']
})
export class CaCityComponent implements OnInit {

  @Input() city: CaCity;

  constructor() {
  }

  ngOnInit(): void {
  }
}
