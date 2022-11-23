import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminBucketRegionsListComponent} from './ca-admin-bucket-regions-list.component';

describe('CaAdminBucketRegionsListComponent', () => {
  let component: CaAdminBucketRegionsListComponent;
  let fixture: ComponentFixture<CaAdminBucketRegionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminBucketRegionsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaAdminBucketRegionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
