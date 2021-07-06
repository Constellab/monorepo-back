import {ChangeDetectionStrategy, Component, Input, OnInit, ViewChild} from '@angular/core';
import {FlMenuDynamic} from '../../model/fl-menu-dynamic.class';
import {MatMenu} from '@angular/material/menu';

@Component({
  selector: 'fl-menu-dynamic',
  templateUrl: './fl-menu-dynamic.component.html',
  styleUrls: ['./fl-menu-dynamic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlMenuDynamicComponent implements OnInit {

  @Input() menuItems: FlMenuDynamic[];

  // use to access the MatMenu from outside
  // use the [matMenuTriggerFor]="menuComponent.menu" with this value to open the menu
  @ViewChild(MatMenu, {static: true}) public menu: MatMenu;

  constructor() {
  }

  ngOnInit(): void {
  }

  translateMenu(menu: FlMenuDynamic): boolean {
    return menu.translateName == null || menu.translateName;
  }

  callItem(menuItem: FlMenuDynamic, event: MouseEvent): void {
    if (menuItem.onClick) {
      menuItem.onClick(event);
    }
  }
}
