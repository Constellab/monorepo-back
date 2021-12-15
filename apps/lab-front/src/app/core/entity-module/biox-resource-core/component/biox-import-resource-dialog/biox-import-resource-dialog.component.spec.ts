import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxImportResourceDialogComponent} from './biox-import-resource-dialog.component';

describe('BioxImportResourceDialogComponent', () => {
  let component: BioxImportResourceDialogComponent;
  let fixture: ComponentFixture<BioxImportResourceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxImportResourceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxImportResourceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
