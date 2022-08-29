import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourcePreviewButtonComponent} from './lab-resource-preview-button.component';

describe('LabResourcePreviewButtonComponent', () => {
  let component: LabResourcePreviewButtonComponent;
  let fixture: ComponentFixture<LabResourcePreviewButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourcePreviewButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabResourcePreviewButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
