import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlSpreadsheetHeaderCellComponent } from './fl-spreadsheet-header-cell.component';

describe('FlSpreadsheetHeaderCellComponent', () => {
  let component: FlSpreadsheetHeaderCellComponent;
  let fixture: ComponentFixture<FlSpreadsheetHeaderCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetHeaderCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetHeaderCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
