import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceDetailComponent} from './ca-lab-instance-detail.component';

describe('LabInstanceDetailCardComponent', () => {
  let component: CaLabInstanceDetailComponent;
  let fixture: ComponentFixture<CaLabInstanceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
