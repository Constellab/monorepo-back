import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabInstanceDetailPageComponent} from './lab-instance-detail-page.component';

describe('LabInstanceDetailPageComponent', () => {
  let component: LabInstanceDetailPageComponent;
  let fixture: ComponentFixture<LabInstanceDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstanceDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstanceDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
