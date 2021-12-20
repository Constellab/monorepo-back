import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabMainAppComponent} from './lab-main-app.component';

describe('MainAppComponent', () => {
  let component: LabMainAppComponent;
  let fixture: ComponentFixture<LabMainAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabMainAppComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabMainAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
