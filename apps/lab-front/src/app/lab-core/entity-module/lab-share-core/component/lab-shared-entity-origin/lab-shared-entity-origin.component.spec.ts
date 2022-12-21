import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSharedEntityOriginComponent} from './lab-shared-entity-origin.component';

describe('LabResourceShareOriginComponent', () => {
  let component: LabSharedEntityOriginComponent;
  let fixture: ComponentFixture<LabSharedEntityOriginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSharedEntityOriginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabSharedEntityOriginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
