import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBucketRegionInlineComponent} from './ca-bucket-region-inline.component';

describe('CaBucketRegionInlineComponent', () => {
  let component: CaBucketRegionInlineComponent;
  let fixture: ComponentFixture<CaBucketRegionInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBucketRegionInlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaBucketRegionInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
