import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabViewTypeImageComponent} from './lab-view-type-image.component';

describe('LabViewTypeImageComponent', () => {
  let component: LabViewTypeImageComponent;
  let fixture: ComponentFixture<LabViewTypeImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabViewTypeImageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabViewTypeImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
