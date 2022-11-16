import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlCompleteLoginComponent} from './fl-complete-login.component';

describe('FlCompleteLoginComponent', () => {
  let component: FlCompleteLoginComponent;
  let fixture: ComponentFixture<FlCompleteLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlCompleteLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlCompleteLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
