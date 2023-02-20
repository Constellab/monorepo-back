import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RvViewImageComponent} from './rv-view-image.component';

describe('RvViewImageComponent', () => {
  let component: RvViewImageComponent;
  let fixture: ComponentFixture<RvViewImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvViewImageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RvViewImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
