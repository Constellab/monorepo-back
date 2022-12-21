import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSharedEntityInfoComponent} from './lab-shared-entity-info.component';

describe('LabSharedEntityListComponent', () => {
  let component: LabSharedEntityInfoComponent;
  let fixture: ComponentFixture<LabSharedEntityInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSharedEntityInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabSharedEntityInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
