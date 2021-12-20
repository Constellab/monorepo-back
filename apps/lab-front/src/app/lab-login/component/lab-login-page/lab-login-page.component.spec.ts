import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabLoginPageComponent} from './lab-login-page.component';

describe('LoginPageComponent', () => {
  let component: LabLoginPageComponent;
  let fixture: ComponentFixture<LabLoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabLoginPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabLoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
