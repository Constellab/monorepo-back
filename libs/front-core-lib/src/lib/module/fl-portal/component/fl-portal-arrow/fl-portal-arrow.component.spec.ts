import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlPortalArrowComponent} from './fl-portal-arrow.component';

describe('LibPortalArrowComponent', () => {
  let component: FlPortalArrowComponent;
  let fixture: ComponentFixture<FlPortalArrowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlPortalArrowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPortalArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
