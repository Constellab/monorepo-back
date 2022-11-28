import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentSpaceDetailComponent} from './ca-current-space-detail.component';

describe('CaSpaceDetailComponent', () => {
  let component: CaCurrentSpaceDetailComponent;
  let fixture: ComponentFixture<CaCurrentSpaceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentSpaceDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaCurrentSpaceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
