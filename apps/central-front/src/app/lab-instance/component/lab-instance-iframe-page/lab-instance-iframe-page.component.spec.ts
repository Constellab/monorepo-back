import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabInstanceIframePageComponent} from './lab-instance-iframe-page.component';

describe('LabInstanceIframePageComponent', () => {
  let component: LabInstanceIframePageComponent;
  let fixture: ComponentFixture<LabInstanceIframePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceIframePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceIframePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
