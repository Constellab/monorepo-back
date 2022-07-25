import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabObjectSyncInfoComponent} from './lab-object-sync-info.component';

describe('LabObjectSyncInfoComponent', () => {
  let component: LabObjectSyncInfoComponent;
  let fixture: ComponentFixture<LabObjectSyncInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabObjectSyncInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabObjectSyncInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
