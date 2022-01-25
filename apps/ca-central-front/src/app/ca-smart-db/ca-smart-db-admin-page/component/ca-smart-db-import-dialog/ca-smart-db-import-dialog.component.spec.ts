import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbImportDialogComponent} from './ca-smart-db-import-dialog.component';

describe('CaSmartDbImportDialogComponent', () => {
  let component: CaSmartDbImportDialogComponent;
  let fixture: ComponentFixture<CaSmartDbImportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbImportDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
