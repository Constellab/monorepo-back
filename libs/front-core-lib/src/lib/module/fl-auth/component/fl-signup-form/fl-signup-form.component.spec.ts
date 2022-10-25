import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlSignupFormComponent} from './fl-signup-form.component';

describe('FlSignupFormComponent', () => {
  let component: FlSignupFormComponent;
  let fixture: ComponentFixture<FlSignupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSignupFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlSignupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
