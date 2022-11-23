import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCloudProviderInlineComponent} from './ca-cloud-provider-inline.component';

describe('CaCloudProviderInlineComponent', () => {
  let component: CaCloudProviderInlineComponent;
  let fixture: ComponentFixture<CaCloudProviderInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCloudProviderInlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCloudProviderInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
