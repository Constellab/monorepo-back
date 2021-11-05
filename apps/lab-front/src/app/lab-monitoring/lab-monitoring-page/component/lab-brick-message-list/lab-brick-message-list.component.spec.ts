import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBrickMessageListComponent} from './lab-brick-message-list.component';

describe('LabBrickMessageListComponent', () => {
  let component: LabBrickMessageListComponent;
  let fixture: ComponentFixture<LabBrickMessageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBrickMessageListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBrickMessageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
