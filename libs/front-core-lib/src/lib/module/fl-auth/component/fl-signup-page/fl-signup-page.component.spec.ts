import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlSignupPageComponent } from './fl-signup-page.component';

describe('FlSignupPageComponent', () => {
  let component: FlSignupPageComponent;
  let fixture: ComponentFixture<FlSignupPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSignupPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlSignupPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
