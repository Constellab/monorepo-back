import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminCloudProvidersListComponent} from './ca-admin-cloud-providers-list.component';

describe('CaAdminCloudProvidersListComponent', () => {
  let component: CaAdminCloudProvidersListComponent;
  let fixture: ComponentFixture<CaAdminCloudProvidersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminCloudProvidersListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaAdminCloudProvidersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
