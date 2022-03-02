import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSpreadsheetHeaderInfoComponent} from './fl-spreadsheet-header-info.component';

describe('FlSpreadsheetHeaderInfoComponent', () => {
  let component: FlSpreadsheetHeaderInfoComponent;
  let fixture: ComponentFixture<FlSpreadsheetHeaderInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetHeaderInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetHeaderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
