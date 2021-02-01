import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceDialogComponent } from './biox-resource-dialog.component';

describe('BioxResourceDialogComponent', () => {
  let component: BioxResourceDialogComponent;
  let fixture: ComponentFixture<BioxResourceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
