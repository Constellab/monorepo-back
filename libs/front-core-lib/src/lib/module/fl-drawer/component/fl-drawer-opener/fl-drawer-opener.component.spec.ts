import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDrawerOpenerComponent} from './fl-drawer-opener.component';

describe('FlDrawerOpenerComponent', () => {
  let component: FlDrawerOpenerComponent;
  let fixture: ComponentFixture<FlDrawerOpenerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDrawerOpenerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlDrawerOpenerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
