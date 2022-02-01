import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabUpdateResourceNameDialogComponent} from './lab-update-resource-name-dialog.component';

describe('LabUpdateResourceNameDialogComponent', () => {
  let component: LabUpdateResourceNameDialogComponent;
  let fixture: ComponentFixture<LabUpdateResourceNameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabUpdateResourceNameDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabUpdateResourceNameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
