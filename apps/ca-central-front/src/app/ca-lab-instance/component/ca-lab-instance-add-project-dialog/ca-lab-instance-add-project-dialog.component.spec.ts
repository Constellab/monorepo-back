import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceAddProjectDialogComponent} from './ca-lab-instance-add-project-dialog.component';

describe('CaLabInstanceAddProjectDialogComponent', () => {
  let component: CaLabInstanceAddProjectDialogComponent;
  let fixture: ComponentFixture<CaLabInstanceAddProjectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceAddProjectDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceAddProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
