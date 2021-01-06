import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabInstanceIframeComponent} from './lab-instance-iframe.component';

describe('LabInstanceIframeComponent', () => {
  let component: LabInstanceIframeComponent;
  let fixture: ComponentFixture<LabInstanceIframeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceIframeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceIframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
