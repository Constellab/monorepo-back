import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectCloudProviderRegionOptionsComponent} from './ca-select-cloud-provider-region-options.component';

describe('CaSelectCloudProviderRegionOptionsComponent', () => {
  let component: CaSelectCloudProviderRegionOptionsComponent;
  let fixture: ComponentFixture<CaSelectCloudProviderRegionOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectCloudProviderRegionOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSelectCloudProviderRegionOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
