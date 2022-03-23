import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSheetChartSelectionComponent} from './fl-sheet-chart-selection.component';

describe('FlSpreadsheetChartSelectionComponent', () => {
  let component: FlSheetChartSelectionComponent;
  let fixture: ComponentFixture<FlSheetChartSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSheetChartSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSheetChartSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
