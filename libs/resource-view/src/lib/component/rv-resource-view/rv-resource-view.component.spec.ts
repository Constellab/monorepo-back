import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RvResourceViewComponent} from './rv-resource-view.component';

describe('RvResourceViewComponent', () => {
  let component: RvResourceViewComponent;
  let fixture: ComponentFixture<RvResourceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvResourceViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RvResourceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
