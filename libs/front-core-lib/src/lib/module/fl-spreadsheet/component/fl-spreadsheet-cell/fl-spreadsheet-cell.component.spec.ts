import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlSpreadsheetCellComponent } from './fl-spreadsheet-cell.component';

describe('FlSpreadsheetCellComponent', () => {
  let component: FlSpreadsheetCellComponent;
  let fixture: ComponentFixture<FlSpreadsheetCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
