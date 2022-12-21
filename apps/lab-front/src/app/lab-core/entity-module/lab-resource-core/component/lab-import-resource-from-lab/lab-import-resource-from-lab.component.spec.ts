import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabImportResourceFromLabComponent} from './lab-import-resource-from-lab.component';

describe('LabImportResourceFromLabComponent', () => {
  let component: LabImportResourceFromLabComponent;
  let fixture: ComponentFixture<LabImportResourceFromLabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabImportResourceFromLabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabImportResourceFromLabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
