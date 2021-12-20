import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSelectResourceDialogComponent} from './lab-select-resource-dialog.component';

describe('BioxSelectResourceDialogComponent', () => {
  let component: LabSelectResourceDialogComponent;
  let fixture: ComponentFixture<LabSelectResourceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSelectResourceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabSelectResourceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
