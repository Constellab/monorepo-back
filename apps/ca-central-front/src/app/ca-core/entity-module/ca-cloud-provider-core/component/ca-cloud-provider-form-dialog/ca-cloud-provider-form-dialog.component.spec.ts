import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCloudProviderFormDialogComponent} from './ca-cloud-provider-form-dialog.component';

describe('CaCloudProviderFormDialogComponent', () => {
  let component: CaCloudProviderFormDialogComponent;
  let fixture: ComponentFixture<CaCloudProviderFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCloudProviderFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCloudProviderFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
