import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceFolderComponent} from './lab-resource-folder.component';

describe('LabResourceFolderComponent', () => {
  let component: LabResourceFolderComponent;
  let fixture: ComponentFixture<LabResourceFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceFolderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
