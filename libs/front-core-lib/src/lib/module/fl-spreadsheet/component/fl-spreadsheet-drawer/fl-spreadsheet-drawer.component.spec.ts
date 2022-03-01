import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSpreadsheetDrawerComponent} from './fl-spreadsheet-drawer.component';

describe('FlSpreadsheetDrawerComponent', () => {
  let component: FlSpreadsheetDrawerComponent;
  let fixture: ComponentFixture<FlSpreadsheetDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetDrawerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
