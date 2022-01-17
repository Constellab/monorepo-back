import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLoginPageComponent} from './ca-login-page.component';

describe('LoginPageComponent', () => {
  let component: CaLoginPageComponent;
  let fixture: ComponentFixture<CaLoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLoginPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
