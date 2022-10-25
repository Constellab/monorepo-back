import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlLoginFormComponent} from './fl-login-form.component';

describe('FlLoginFormComponent', () => {
  let component: FlLoginFormComponent;
  let fixture: ComponentFixture<FlLoginFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlLoginFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlLoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
