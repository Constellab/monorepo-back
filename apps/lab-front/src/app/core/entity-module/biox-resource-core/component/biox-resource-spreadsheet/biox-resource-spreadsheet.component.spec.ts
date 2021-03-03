import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceSpreadsheetComponent } from './biox-resource-spreadsheet.component';

describe('BioxResourceSpreadsheetComponent', () => {
  let component: BioxResourceSpreadsheetComponent;
  let fixture: ComponentFixture<BioxResourceSpreadsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceSpreadsheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceSpreadsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
