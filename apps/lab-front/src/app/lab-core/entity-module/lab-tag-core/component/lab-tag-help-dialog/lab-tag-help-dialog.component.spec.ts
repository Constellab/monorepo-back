import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTagHelpDialogComponent} from './lab-tag-help-dialog.component';

describe('LabTagHelpPortalComponent', () => {
  let component: LabTagHelpDialogComponent;
  let fixture: ComponentFixture<LabTagHelpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTagHelpDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTagHelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
