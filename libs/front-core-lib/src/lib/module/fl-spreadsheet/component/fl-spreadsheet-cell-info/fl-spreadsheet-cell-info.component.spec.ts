import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSpreadsheetCellInfoComponent} from './fl-spreadsheet-cell-info.component';

describe('FlSpreadsheetCellInfoComponent', () => {
  let component: FlSpreadsheetCellInfoComponent;
  let fixture: ComponentFixture<FlSpreadsheetCellInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetCellInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetCellInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
