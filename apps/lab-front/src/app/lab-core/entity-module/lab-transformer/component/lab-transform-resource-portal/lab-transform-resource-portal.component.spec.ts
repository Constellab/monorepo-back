import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTransformResourcePortalComponent} from './lab-transform-resource-portal.component';

describe('BioxTransformResourceDialogComponent', () => {
  let component: LabTransformResourcePortalComponent;
  let fixture: ComponentFixture<LabTransformResourcePortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTransformResourcePortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTransformResourcePortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
