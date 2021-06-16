import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlPathwayDrawerActionComponent} from './fl-pathway-drawer-action.component';

describe('FlPathwayDrawerActionComponent', () => {
  let component: FlPathwayDrawerActionComponent;
  let fixture: ComponentFixture<FlPathwayDrawerActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlPathwayDrawerActionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlPathwayDrawerActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
