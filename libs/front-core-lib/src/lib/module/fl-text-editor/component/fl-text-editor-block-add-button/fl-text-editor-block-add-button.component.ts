import {Component, OnInit} from '@angular/core';
import {FlTextEditorState} from '../../state/fl-text-editor.state';

@Component({
  selector: 'fl-text-editor-block-add-button',
  templateUrl: './fl-text-editor-block-add-button.component.html',
  styleUrls: ['./fl-text-editor-block-add-button.component.scss']
})
export class FlTextEditorBlockAddButtonComponent implements OnInit {

  showMenu: boolean;

  constructor(private state: FlTextEditorState) {
  }

  ngOnInit(): void {
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  get icon(): string {
    return this.showMenu ? 'clear' : 'add';
  }

  uploadImage(file: File | File[]): void {
    this.state.insertImageFromFile(file as File);
    this.closeMenu();
  }

  insertCode(): void {
    this.state.insertCodeBlock();
    this.closeMenu();
  }

  insertBlockquote(): void {
    this.state.insertBlockQuote();
    this.closeMenu();
  }

  closeMenu(): void{
    this.showMenu = false;
  }
}
