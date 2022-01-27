import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabUpdateResourceTypeComponent} from './lab-update-resource-type.component';

describe('LabUpdateFileTypeComponent', () => {
  let component: LabUpdateResourceTypeComponent;
  let fixture: ComponentFixture<LabUpdateResourceTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabUpdateResourceTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabUpdateResourceTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
