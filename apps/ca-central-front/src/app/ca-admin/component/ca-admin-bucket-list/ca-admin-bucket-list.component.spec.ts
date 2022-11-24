import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminBucketListComponent} from './ca-admin-bucket-list.component';

describe('CaAdminBucketListComponent', () => {
  let component: CaAdminBucketListComponent;
  let fixture: ComponentFixture<CaAdminBucketListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminBucketListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaAdminBucketListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
