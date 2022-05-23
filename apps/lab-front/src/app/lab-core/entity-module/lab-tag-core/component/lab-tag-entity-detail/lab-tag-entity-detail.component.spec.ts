import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTagEntityDetailComponent} from './lab-tag-entity-detail.component';

describe('LabTagDetailComponent', () => {
  let component: LabTagEntityDetailComponent;
  let fixture: ComponentFixture<LabTagEntityDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTagEntityDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTagEntityDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
