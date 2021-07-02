import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSpreadsheetChartSerieSelectionComponent} from './fl-spreadsheet-chart-serie-selection.component';

describe('FlSpreadsheetChartSerieSelectionComponent', () => {
  let component: FlSpreadsheetChartSerieSelectionComponent;
  let fixture: ComponentFixture<FlSpreadsheetChartSerieSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetChartSerieSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetChartSerieSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
