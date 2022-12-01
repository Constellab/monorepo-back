import {Component, HostBinding, Input, OnInit} from '@angular/core';

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

  @HostBinding('class.mat-elevation-z5')
  @Input() elevation: boolean = true;

  constructor() {
  }

  ngOnInit(): void {
  }

}
