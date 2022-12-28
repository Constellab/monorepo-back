import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminCloudProviderRegionsListComponent} from './ca-admin-cloud-provider-regions-list.component';

describe('CaAdminCloudProviderRegionsListComponent', () => {
  let component: CaAdminCloudProviderRegionsListComponent;
  let fixture: ComponentFixture<CaAdminCloudProviderRegionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminCloudProviderRegionsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaAdminCloudProviderRegionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
