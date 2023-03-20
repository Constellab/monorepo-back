import {ChangeDetectionStrategy, Component, Input, OnInit, ViewChild} from '@angular/core';
import {FlMenuDynamic, FlMenuDynamicButton} from '../../model/fl-menu-dynamic.class';
import {MatMenu, MatMenuTrigger, MenuPositionX, MenuPositionY} from '@angular/material/menu';
@Component({
  selector: 'fl-menu-dynamic',
  templateUrl: './fl-menu-dynamic.component.html',
  styleUrls: ['./fl-menu-dynamic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlMenuDynamicComponent implements OnInit {

  public static readonly containerClass = 'fl-dynamic-menu';

  @Input() menuItems: FlMenuDynamic[];

  @Input() hasBackdrop: boolean = true;

  @Input() xPosition: MenuPositionX = 'after';

  @Input() yPosition: MenuPositionY = 'below';

  // use to access the MatMenu from outside
  // use the [matMenuTriggerFor]="menuComponent.menu" with this value to open the menu
  @ViewChild(MatMenu, {static: true}) public menu: MatMenu;

  @ViewChild(MatMenuTrigger, {static: false}) menuTrigger: MatMenuTrigger;

  containerClass = FlMenuDynamicComponent.containerClass;

  constructor() {
  }

  ngOnInit(): void {
  }

  callItem(menuItem: FlMenuDynamicButton, event: MouseEvent): void {
    if (menuItem.onClick) {
      menuItem.onClick(event);
    }
  }
}
