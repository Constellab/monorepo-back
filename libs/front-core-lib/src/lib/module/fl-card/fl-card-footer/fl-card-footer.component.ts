import {Component, Input, OnInit} from '@angular/core';

/**
 * Footer for the card
 */
@Component({
  selector: 'fl-card-footer',
  templateUrl: './fl-card-footer.component.html',
  styleUrls: ['./fl-card-footer.component.scss']
})
export class FlCardFooterComponent implements OnInit {

  @Input() layoutGap: string = '0';

  constructor() {
  }

  ngOnInit(): void {
  }

}
