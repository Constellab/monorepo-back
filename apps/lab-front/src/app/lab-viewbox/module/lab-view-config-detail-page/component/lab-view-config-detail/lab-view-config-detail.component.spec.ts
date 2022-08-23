import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabViewConfigDetailComponent} from './lab-view-config-detail.component';

describe('LabViewConfigDetailComponent', () => {
  let component: LabViewConfigDetailComponent;
  let fixture: ComponentFixture<LabViewConfigDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabViewConfigDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabViewConfigDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
