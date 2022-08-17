import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlMenuDynamic, FlMenuDynamicButton} from '../../model/fl-menu-dynamic.class';

/**
 * Leaf button of the DynamicMenu, doesn't work for parent buttons
 */
@Component({
  selector: 'fl-menu-dynamic-button',
  templateUrl: './fl-menu-dynamic-button.component.html',
  styleUrls: ['./fl-menu-dynamic-button.component.scss']
})
export class FlMenuDynamicButtonComponent implements OnInit {

  @Input() menuDynamic: FlMenuDynamic;

  @Output() buttonClick: EventEmitter<FlMenuDynamic> = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

  callItem(menuItem: FlMenuDynamicButton, event: MouseEvent): void {
    if (menuItem.onClick) {
      menuItem.onClick(event);
    }
    this.buttonClick.next(menuItem);
  }
}
