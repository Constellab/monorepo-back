import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxSelectResourceDialogComponent } from './biox-select-resource-dialog.component';

describe('BioxSelectResourceDialogComponent', () => {
  let component: BioxSelectResourceDialogComponent;
  let fixture: ComponentFixture<BioxSelectResourceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxSelectResourceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxSelectResourceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
