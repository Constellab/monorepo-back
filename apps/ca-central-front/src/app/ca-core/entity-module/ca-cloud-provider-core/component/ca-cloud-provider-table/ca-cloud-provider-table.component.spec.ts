import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCloudProviderTableComponent} from './ca-cloud-provider-table.component';

describe('CaCloudProviderTableComponent', () => {
  let component: CaCloudProviderTableComponent;
  let fixture: ComponentFixture<CaCloudProviderTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCloudProviderTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCloudProviderTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
