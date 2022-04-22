import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RvViewMultiViewsComponent} from './rv-view-multi-views.component';

describe('BioxResourceMultiViewComponent', () => {
  let component: RvViewMultiViewsComponent;
  let fixture: ComponentFixture<RvViewMultiViewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvViewMultiViewsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RvViewMultiViewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
