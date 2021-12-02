import { Component, OnInit } from '@angular/core';

/**
 * To put on fl-portal, this is at this end and this is not a part of the content so this is not scrollable
 */
@Component({
  selector: 'fl-portal-footer',
  templateUrl: './fl-portal-footer.component.html',
  styleUrls: ['./fl-portal-footer.component.scss']
})
export class FlPortalFooterComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
