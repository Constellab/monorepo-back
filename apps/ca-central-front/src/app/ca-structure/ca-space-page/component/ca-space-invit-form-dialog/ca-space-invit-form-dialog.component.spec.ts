import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceInvitFormDialogComponent} from './ca-space-invit-form-dialog.component';

describe('CaSpaceInvitFormDialogComponent', () => {
  let component: CaSpaceInvitFormDialogComponent;
  let fixture: ComponentFixture<CaSpaceInvitFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceInvitFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSpaceInvitFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
