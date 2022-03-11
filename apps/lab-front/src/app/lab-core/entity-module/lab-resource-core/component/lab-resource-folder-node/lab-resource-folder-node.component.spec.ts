import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceFolderNodeComponent} from './lab-resource-folder-node.component';

describe('LabResourceFolderNodeComponent', () => {
  let component: LabResourceFolderNodeComponent;
  let fixture: ComponentFixture<LabResourceFolderNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceFolderNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceFolderNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
