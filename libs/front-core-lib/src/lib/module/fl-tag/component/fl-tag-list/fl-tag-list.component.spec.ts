import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlTagListComponent} from './fl-tag-list.component';

describe('FlTagListComponent', () => {
  let component: FlTagListComponent;
  let fixture: ComponentFixture<FlTagListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlTagListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTagListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
