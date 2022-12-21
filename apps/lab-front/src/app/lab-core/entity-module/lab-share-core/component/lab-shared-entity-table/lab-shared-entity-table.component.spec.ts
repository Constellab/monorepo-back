import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSharedEntityTableComponent} from './lab-shared-entity-table.component';

describe('LabSharedEntityTableComponent', () => {
  let component: LabSharedEntityTableComponent;
  let fixture: ComponentFixture<LabSharedEntityTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSharedEntityTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabSharedEntityTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
