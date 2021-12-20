import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceImageComponent} from './lab-resource-image.component';

describe('BioxResourceImageComponent', () => {
  let component: LabResourceImageComponent;
  let fixture: ComponentFixture<LabResourceImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
