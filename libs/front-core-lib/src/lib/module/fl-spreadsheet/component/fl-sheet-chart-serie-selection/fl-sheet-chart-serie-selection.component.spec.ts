import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSheetChartSerieSelectionComponent} from './fl-sheet-chart-serie-selection.component';

describe('FlSpreadsheetChartSerieSelectionComponent', () => {
  let component: FlSheetChartSerieSelectionComponent;
  let fixture: ComponentFixture<FlSheetChartSerieSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSheetChartSerieSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSheetChartSerieSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
