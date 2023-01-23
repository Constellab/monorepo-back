import {Component, Input, OnInit} from '@angular/core';
import {FlUser} from '../../model/fl-user.class';

@Component({
  selector: 'fl-user-inline',
  templateUrl: './fl-user-inline.component.html',
  styleUrls: ['./fl-user-inline.component.scss']
})
export class FlUserInlineComponent implements OnInit {

  @Input() user: FlUser;

  @Input() showName: boolean = true;

  @Input() showPopUp: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
