import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSignupDialogComponent} from './fl-signup-dialog.component';

describe('SignupDialogComponent', () => {
  let component: FlSignupDialogComponent;
  let fixture: ComponentFixture<FlSignupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSignupDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSignupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
