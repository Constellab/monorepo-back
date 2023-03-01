import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaLabOnPremiseDownloadConfigComponent } from './ca-lab-on-premise-download-config.component';

describe('CaLabOnPremiseDownloadConfigComponent', () => {
  let component: CaLabOnPremiseDownloadConfigComponent;
  let fixture: ComponentFixture<CaLabOnPremiseDownloadConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabOnPremiseDownloadConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabOnPremiseDownloadConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
