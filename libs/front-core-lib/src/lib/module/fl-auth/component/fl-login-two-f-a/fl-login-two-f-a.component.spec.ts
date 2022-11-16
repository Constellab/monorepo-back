import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlLoginTwoFAComponent} from './fl-login-two-f-a.component';

describe('FlLoginTwoFAComponent', () => {
  let component: FlLoginTwoFAComponent;
  let fixture: ComponentFixture<FlLoginTwoFAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlLoginTwoFAComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlLoginTwoFAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
