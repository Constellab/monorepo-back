import {Component, Input, OnInit} from '@angular/core';

/**
 * Generic component to use on portal to normalize style and prevent portal form being too big
 * Support <fl-portal-header>, <fl-portal-content> and <fl-portal-footer>
 */
@Component({
  selector: 'fl-portal',
  templateUrl: './fl-portal.component.html',
  styleUrls: ['./fl-portal.component.scss']
})
export class FlPortalComponent implements OnInit {

  /**
   * When true flPortalZIndex directive is disabled. Portal won't be moved on top of others on mousedown
   */
  @Input() flPortalZIndexDisabled: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
