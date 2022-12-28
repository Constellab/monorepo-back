import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCloudProviderRegionTableComponent} from './ca-cloud-provider-region-table.component';

describe('CaCloudProviderRegionTableComponent', () => {
  let component: CaCloudProviderRegionTableComponent;
  let fixture: ComponentFixture<CaCloudProviderRegionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCloudProviderRegionTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCloudProviderRegionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
