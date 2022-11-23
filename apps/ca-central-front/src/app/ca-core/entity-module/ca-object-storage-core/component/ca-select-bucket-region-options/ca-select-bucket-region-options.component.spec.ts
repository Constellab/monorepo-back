import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectBucketRegionOptionsComponent} from './ca-select-bucket-region-options.component';

describe('CaSelectBucketRegionOptionsComponent', () => {
  let component: CaSelectBucketRegionOptionsComponent;
  let fixture: ComponentFixture<CaSelectBucketRegionOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectBucketRegionOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSelectBucketRegionOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
