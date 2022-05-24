import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTypeDialogComponent} from './lab-type-dialog.component';

describe('BioxProcessTypePortalComponent', () => {
  let component: LabTypeDialogComponent;
  let fixture: ComponentFixture<LabTypeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTypeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
