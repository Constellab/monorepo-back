import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {PortalArrowComponent} from './portal-arrow.component';

describe('LibPortalArrowComponent', () => {
  let component: PortalArrowComponent;
  let fixture: ComponentFixture<PortalArrowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PortalArrowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
