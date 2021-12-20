import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceDetailPageComponent} from './ca-lab-instance-detail-page.component';

describe('LabInstanceDetailPageComponent', () => {
  let component: CaLabInstanceDetailPageComponent;
  let fixture: ComponentFixture<CaLabInstanceDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
