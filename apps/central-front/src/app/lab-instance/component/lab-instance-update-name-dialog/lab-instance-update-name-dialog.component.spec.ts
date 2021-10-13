import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabInstanceUpdateNameDialogComponent} from './lab-instance-update-name-dialog.component';

describe('LabInstanceUpdateNameDialogComponent', () => {
  let component: LabInstanceUpdateNameDialogComponent;
  let fixture: ComponentFixture<LabInstanceUpdateNameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceUpdateNameDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceUpdateNameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
