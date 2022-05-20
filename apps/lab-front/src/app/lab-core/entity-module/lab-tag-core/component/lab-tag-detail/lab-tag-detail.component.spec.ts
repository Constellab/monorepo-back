import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTagDetailComponent} from './lab-tag-detail.component';

describe('LabTagDetailComponent', () => {
  let component: LabTagDetailComponent;
  let fixture: ComponentFixture<LabTagDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTagDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTagDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
