import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSpreadsheetRangesInputComponent} from './fl-spreadsheet-ranges-input.component';

describe('FlSpreadsheetRangesInputComponent', () => {
  let component: FlSpreadsheetRangesInputComponent;
  let fixture: ComponentFixture<FlSpreadsheetRangesInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetRangesInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetRangesInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
