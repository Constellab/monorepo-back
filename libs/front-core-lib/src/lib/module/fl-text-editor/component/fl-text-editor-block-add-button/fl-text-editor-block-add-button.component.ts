import {Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {FlTextEditorBlockAddButton} from '../../model/fl-text-editor.class';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlPortalService} from '../../../fl-portal/service/fl-portal.service';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {ClHelpService} from '@monorepo/core-lib';

@Component({
  selector: 'fl-text-editor-block-add-button',
  templateUrl: './fl-text-editor-block-add-button.component.html',
  styleUrls: ['./fl-text-editor-block-add-button.component.scss']
})
export class FlTextEditorBlockAddButtonComponent implements OnInit, OnDestroy {

  showMenu: boolean;

  buttons: FlTextEditorBlockAddButton[];

  childrenButtons: FlTextEditorBlockAddButton[];

  @ViewChild('submenu') subMenu: TemplateRef<unknown>;


  private subMenuOverlay: FlOverlayRef;

  constructor(@Inject(FL_PORTAL_DATA) buttons: FlTextEditorBlockAddButton[],
              private portalService: FlPortalService,
              private _viewContainerRef: ViewContainerRef) {
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
    if (!button.onAction) return;
    button.onAction(event);
    this.closeMenu();
  }

  closeMenu(): void {
    this.showMenu = false;
    this.closeSubMenuOverlay();
  }

  openSubMenu(button: FlTextEditorBlockAddButton, ev: MouseEvent): void {
    this.closeSubMenuOverlay();
    if (ClHelpService.isNullOrEmpty(button.children)) return;

    this.childrenButtons = button.children;
    const config = this.portalService.configureRelativePortalFromMouseEvent(ev, ['bottom', 'top']);
    this.subMenuOverlay = this.portalService.createPortalTemplate(this.subMenu, config, this._viewContainerRef);
  }

  closeSubMenuOverlay(): void {
    this.subMenuOverlay?.dispose();
    this.subMenuOverlay = null;
  }

  ngOnDestroy(): void {
    this.closeSubMenuOverlay();
  }


}
