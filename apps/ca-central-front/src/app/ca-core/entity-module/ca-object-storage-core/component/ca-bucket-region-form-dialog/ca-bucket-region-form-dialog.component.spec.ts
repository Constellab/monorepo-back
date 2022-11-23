import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBucketRegionFormDialogComponent} from './ca-bucket-region-form-dialog.component';

describe('CaBucketRegionFormDialogComponent', () => {
  let component: CaBucketRegionFormDialogComponent;
  let fixture: ComponentFixture<CaBucketRegionFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBucketRegionFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaBucketRegionFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
