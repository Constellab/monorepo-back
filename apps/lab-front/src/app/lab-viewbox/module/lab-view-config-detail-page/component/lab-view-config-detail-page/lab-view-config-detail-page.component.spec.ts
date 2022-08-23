import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabViewConfigDetailPageComponent} from './lab-view-config-detail-page.component';

describe('LabViewDetailPageComponent', () => {
  let component: LabViewConfigDetailPageComponent;
  let fixture: ComponentFixture<LabViewConfigDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabViewConfigDetailPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabViewConfigDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
