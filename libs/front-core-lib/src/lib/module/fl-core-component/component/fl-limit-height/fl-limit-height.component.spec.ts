import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlLimitHeightComponent} from './fl-limit-height.component';

describe('LimitHeightComponent', () => {
  let component: FlLimitHeightComponent;
  let fixture: ComponentFixture<FlLimitHeightComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlLimitHeightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlLimitHeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
