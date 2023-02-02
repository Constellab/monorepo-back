import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlLastModificationInfoComponent} from './fl-last-modification-info.component';

describe('FlLastModificationInfoComponent', () => {
  let component: FlLastModificationInfoComponent;
  let fixture: ComponentFixture<FlLastModificationInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlLastModificationInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlLastModificationInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
