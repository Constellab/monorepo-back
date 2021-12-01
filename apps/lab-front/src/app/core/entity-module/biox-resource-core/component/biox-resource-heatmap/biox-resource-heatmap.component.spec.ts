import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceHeatmapComponent } from './biox-resource-heatmap.component';

describe('BioxResourceHeatmapComponent', () => {
  let component: BioxResourceHeatmapComponent;
  let fixture: ComponentFixture<BioxResourceHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceHeatmapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
