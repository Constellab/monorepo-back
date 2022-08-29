import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceViewFolderComponent} from './lab-resource-view-folder.component';

describe('LabResourceFolderComponent', () => {
  let component: LabResourceViewFolderComponent;
  let fixture: ComponentFixture<LabResourceViewFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceViewFolderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceViewFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
