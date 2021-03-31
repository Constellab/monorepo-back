import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlSpreadsheetSelectionInputComponent } from './fl-spreadsheet-selection-input.component';

describe('FlSpreadsheetSelectionInputComponent', () => {
  let component: FlSpreadsheetSelectionInputComponent;
  let fixture: ComponentFixture<FlSpreadsheetSelectionInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetSelectionInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetSelectionInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
