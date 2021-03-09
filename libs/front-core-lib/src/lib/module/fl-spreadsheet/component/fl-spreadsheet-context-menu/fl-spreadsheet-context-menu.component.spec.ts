import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlSpreadsheetContextMenuComponent } from './fl-spreadsheet-context-menu.component';

describe('FlSpreadsheetContextMenuComponent', () => {
  let component: FlSpreadsheetContextMenuComponent;
  let fixture: ComponentFixture<FlSpreadsheetContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSpreadsheetContextMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSpreadsheetContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
