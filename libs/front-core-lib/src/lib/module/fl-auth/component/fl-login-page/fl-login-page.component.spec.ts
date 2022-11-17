import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlLoginPageComponent} from './fl-login-page.component';

describe('FlLoginPageComponent', () => {
  let component: FlLoginPageComponent;
  let fixture: ComponentFixture<FlLoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlLoginPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlLoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
