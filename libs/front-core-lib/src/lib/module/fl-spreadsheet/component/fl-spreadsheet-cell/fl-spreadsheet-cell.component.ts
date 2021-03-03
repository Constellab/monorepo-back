import {Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {FlCell} from '../../model/fl-cell.class';

@Component({
  selector: 'fl-spreadsheet-cell',
  templateUrl: './fl-spreadsheet-cell.component.html',
  styleUrls: ['./fl-spreadsheet-cell.component.scss']
})
export class FlSpreadsheetCellComponent implements OnInit {

  @Input() cell: FlCell;

  @ViewChild('container', {static: true}) content: ElementRef<HTMLElement>;
  @ViewChild('input') input: ElementRef<HTMLElement>;

  edit: boolean = false;


  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // ignore if we already are in edit mode
    // ignore if key is not a single character
    if(this.edit || event.key.length > 1){
      return;
    }

    console.log('Keydown', event.key);
    this.cell.value += event.key;
    // when pressing a key, we enable the edit
    this.enableEditMode();
  }


  constructor() {
  }

  ngOnInit(): void {
  }

  enableEditMode(): void {
    if (!this.edit) {
      this.edit = true;

      setTimeout(() => {
        this.input?.nativeElement.focus();
      });
    }
  }


  disableEditMode(): void {
    this.edit = false;
  }

}
