import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlResetPasswordPageComponent} from './fl-reset-password-page.component';

describe('ResetPasswordPageComponent', () => {
  let component: FlResetPasswordPageComponent;
  let fixture: ComponentFixture<FlResetPasswordPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlResetPasswordPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlResetPasswordPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
