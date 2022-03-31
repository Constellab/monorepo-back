import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

/**
 * Menu bar that can grow and shrink.
 */
@Component({
  selector: 'fl-expansion-menu',
  templateUrl: './fl-expansion-menu.component.html',
  styleUrls: ['./fl-expansion-menu.component.scss']
})
export class FlExpansionMenuComponent implements OnInit {

  @Input() expanded: boolean = false;
  @Output() expandedChange: EventEmitter<boolean> = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

  get menuClass(): string {
    return this.expanded ? 'menu-large' : 'menu-small';
  }

  public toggleMenu(): void {
    this.expanded = !this.expanded;
    this.expandedChange.next(this.expanded);
  }
}
