import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceIframePageComponent} from './ca-lab-instance-iframe-page.component';

describe('LabInstanceIframePageComponent', () => {
  let component: CaLabInstanceIframePageComponent;
  let fixture: ComponentFixture<CaLabInstanceIframePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceIframePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceIframePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
