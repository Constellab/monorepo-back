import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {LimitHeightComponent} from './limit-height.component';

describe('LimitHeightComponent', () => {
  let component: LimitHeightComponent;
  let fixture: ComponentFixture<LimitHeightComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LimitHeightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LimitHeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
