import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {Observable} from 'rxjs';
import {FlSheet} from '../../model/fl-sheet.class';
import {FormControl} from '@ngneat/reactive-forms';
import {MatButtonToggleChange} from '@angular/material/button-toggle';

/**
 * Component to show the list of sheets with possibility to select one
 */
@Component({
  selector: 'fl-spreadsheet-sheet-selection',
  templateUrl: './fl-spreadsheet-sheet-selection.component.html',
  styleUrls: ['./fl-spreadsheet-sheet-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetSheetSelectionComponent implements OnInit {

  sheets$: Observable<FlSheet[]>;

  formControl: FormControl<number> = new FormControl();

  constructor(private state: FlSpreadsheetState) {
  }

  ngOnInit(): void {
    this.sheets$ = this.state.spreadsheet.getSheets$();

    this.state.spreadsheet.getCurrentSheet$().subscribe(
      sheet => this.formControl.patchValue(sheet.id)
    );
  }

  selectSpreadsheet(change: MatButtonToggleChange): void {
    this.state.spreadsheet.selectSheet(change.value);
  }

}
