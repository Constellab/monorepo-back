import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DaLoginPageComponent} from './da-login-page.component';

describe('LoginPageComponent', () => {
  let component: DaLoginPageComponent;
  let fixture: ComponentFixture<DaLoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaLoginPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaLoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
