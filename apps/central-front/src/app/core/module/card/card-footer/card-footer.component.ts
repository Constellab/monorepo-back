import {Component, Input, OnInit} from '@angular/core';

/**
 * Footer for the card
 */
@Component({
  selector: 'gen-card-footer',
  templateUrl: './card-footer.component.html',
  styleUrls: ['./card-footer.component.scss']
})
export class CardFooterComponent implements OnInit {

  @Input() layoutGap: string = '0';

  constructor() {
  }

  ngOnInit(): void {
  }

}
