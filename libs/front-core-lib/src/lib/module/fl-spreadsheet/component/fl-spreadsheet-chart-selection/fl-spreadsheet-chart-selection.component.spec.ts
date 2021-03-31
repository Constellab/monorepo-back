import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlSpreadsheetChartSelectionComponent } from './fl-spreadsheet-chart-selection.component';

describe('FlSpreadsheetChartSelectionComponent', () => {
  let component: FlSpreadsheetChartSelectionComponent;
  let fixture: ComponentFixture<FlSpreadsheetChartSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetChartSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetChartSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
