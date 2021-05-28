import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlLoginComponent } from './fl-login.component';

describe('FlLoginComponent', () => {
  let component: FlLoginComponent;
  let fixture: ComponentFixture<FlLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
