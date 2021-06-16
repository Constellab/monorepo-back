import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlPathwayConfigComponent} from './fl-pathway-config.component';

describe('FlPathwayConfigComponent', () => {
  let component: FlPathwayConfigComponent;
  let fixture: ComponentFixture<FlPathwayConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPathwayConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPathwayConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
