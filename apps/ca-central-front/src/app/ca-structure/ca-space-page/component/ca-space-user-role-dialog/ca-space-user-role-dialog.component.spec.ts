import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceUserRoleDialogComponent} from './ca-space-user-role-dialog.component';

describe('CaSpaceUserRoleDialogComponent', () => {
  let component: CaSpaceUserRoleDialogComponent;
  let fixture: ComponentFixture<CaSpaceUserRoleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceUserRoleDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSpaceUserRoleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
