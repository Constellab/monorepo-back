import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBucketRegionTableComponent} from './ca-bucket-region-table.component';

describe('CaBucketRegionTableComponent', () => {
  let component: CaBucketRegionTableComponent;
  let fixture: ComponentFixture<CaBucketRegionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBucketRegionTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaBucketRegionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
