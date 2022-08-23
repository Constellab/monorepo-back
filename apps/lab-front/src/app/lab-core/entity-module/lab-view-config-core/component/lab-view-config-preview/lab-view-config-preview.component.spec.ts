import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabViewConfigPreviewComponent} from './lab-view-config-preview.component';

describe('LabViewConfigPreviewComponent', () => {
  let component: LabViewConfigPreviewComponent;
  let fixture: ComponentFixture<LabViewConfigPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabViewConfigPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabViewConfigPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
