import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTransformResourceComponent} from './lab-transform-resource.component';

describe('BioxTransformResourceComponent', () => {
  let component: LabTransformResourceComponent;
  let fixture: ComponentFixture<LabTransformResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTransformResourceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTransformResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
