import {Component, Input, OnInit} from '@angular/core';

/**
 * Simple card use to add an object
 */
@Component({
  selector: 'ca-add-card',
  templateUrl: './ca-add-card.component.html',
  styleUrls: ['./ca-add-card.component.scss']
})
export class CaAddCardComponent implements OnInit {

  @Input() cardTitle: string;


  constructor() {
  }

  ngOnInit(): void {
  }

}
