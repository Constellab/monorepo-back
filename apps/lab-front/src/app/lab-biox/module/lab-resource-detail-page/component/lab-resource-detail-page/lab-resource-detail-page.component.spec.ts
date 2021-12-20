import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceDetailPageComponent} from './lab-resource-detail-page.component';

describe('BioxResourceDetailPageComponent', () => {
  let component: LabResourceDetailPageComponent;
  let fixture: ComponentFixture<LabResourceDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
