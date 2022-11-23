import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectCloudProviderOptionsComponent} from './ca-select-cloud-provider-options.component';

describe('ServerInfoHostSelectOptionsComponent', () => {
  let component: CaSelectCloudProviderOptionsComponent;
  let fixture: ComponentFixture<CaSelectCloudProviderOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectCloudProviderOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSelectCloudProviderOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
