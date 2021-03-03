import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlSpreadsheetComponent } from './fl-spreadsheet.component';

describe('FlSpreadsheetComponent', () => {
  let component: FlSpreadsheetComponent;
  let fixture: ComponentFixture<FlSpreadsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
