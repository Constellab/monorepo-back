import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlPasswordForgottenComponent} from './fl-password-forgotten.component';

describe('PasswordForgottenComponent', () => {
  let component: FlPasswordForgottenComponent;
  let fixture: ComponentFixture<FlPasswordForgottenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPasswordForgottenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPasswordForgottenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
