import {Component, Inject, OnInit} from '@angular/core';
import {FlTextEditorBlockAddButton} from '../../model/fl-text-editor.class';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';

@Component({
  selector: 'fl-text-editor-block-add-button',
  templateUrl: './fl-text-editor-block-add-button.component.html',
  styleUrls: ['./fl-text-editor-block-add-button.component.scss']
})
export class FlTextEditorBlockAddButtonComponent implements OnInit {

  showMenu: boolean;

  buttons: FlTextEditorBlockAddButton[];

  constructor(@Inject(FL_PORTAL_DATA) buttons: FlTextEditorBlockAddButton[]) {
    this.buttons = buttons;
  }

  ngOnInit(): void {
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  get icon(): string {
    return this.showMenu ? 'clear' : 'add';
  }

  onAction(button: FlTextEditorBlockAddButton, event: any): void {
    button.onAction(event);
    this.closeMenu();
  }

  closeMenu(): void {
    this.showMenu = false;
  }
}
