import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlLastSyncInfoComponent} from './fl-last-sync-info.component';

describe('FlLastSyncInfoComponent', () => {
  let component: FlLastSyncInfoComponent;
  let fixture: ComponentFixture<FlLastSyncInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlLastSyncInfoComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FlLastSyncInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
