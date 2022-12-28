import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCloudProviderRegionInlineComponent} from './ca-cloud-provider-region-inline.component';

describe('CaCloudProviderRegionInlineComponent', () => {
  let component: CaCloudProviderRegionInlineComponent;
  let fixture: ComponentFixture<CaCloudProviderRegionInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCloudProviderRegionInlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCloudProviderRegionInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
