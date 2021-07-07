import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSpreadsheetSheetSelectionComponent} from './fl-spreadsheet-sheet-selection.component';

describe('FlSpreadhseetSheetSelectionComponent', () => {
  let component: FlSpreadsheetSheetSelectionComponent;
  let fixture: ComponentFixture<FlSpreadsheetSheetSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetSheetSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetSheetSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
