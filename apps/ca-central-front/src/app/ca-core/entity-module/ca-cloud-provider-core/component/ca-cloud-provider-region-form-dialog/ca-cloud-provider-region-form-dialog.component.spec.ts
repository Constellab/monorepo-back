import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCloudProviderRegionFormDialogComponent} from './ca-cloud-provider-region-form-dialog.component';

describe('CaCloudProviderRegionFormDialogComponent', () => {
  let component: CaCloudProviderRegionFormDialogComponent;
  let fixture: ComponentFixture<CaCloudProviderRegionFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCloudProviderRegionFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCloudProviderRegionFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
