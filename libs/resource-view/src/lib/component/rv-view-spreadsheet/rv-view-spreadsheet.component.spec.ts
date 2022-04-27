import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RvViewSpreadsheetComponent} from './rv-view-spreadsheet.component';

describe('BioxResourceSpreadsheetComponent', () => {
  let component: RvViewSpreadsheetComponent;
  let fixture: ComponentFixture<RvViewSpreadsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvViewSpreadsheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RvViewSpreadsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
