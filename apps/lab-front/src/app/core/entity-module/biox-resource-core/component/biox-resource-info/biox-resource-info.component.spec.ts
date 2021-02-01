import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceInfoComponent } from './biox-resource-info.component';

describe('BioxResouceInfoComponent', () => {
  let component: BioxResourceInfoComponent;
  let fixture: ComponentFixture<BioxResourceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
