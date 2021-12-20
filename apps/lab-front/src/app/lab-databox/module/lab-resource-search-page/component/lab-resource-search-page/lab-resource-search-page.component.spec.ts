import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceSearchPageComponent} from './lab-resource-search-page.component';

describe('BioxResourceSearchPageComponent', () => {
  let component: LabResourceSearchPageComponent;
  let fixture: ComponentFixture<LabResourceSearchPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceSearchPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceSearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
