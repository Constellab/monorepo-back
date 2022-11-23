import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminBucketCredentialsListComponent} from './ca-admin-bucket-credentials-list.component';

describe('CaAdminBucketCredentialsListComponent', () => {
  let component: CaAdminBucketCredentialsListComponent;
  let fixture: ComponentFixture<CaAdminBucketCredentialsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminBucketCredentialsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaAdminBucketCredentialsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
