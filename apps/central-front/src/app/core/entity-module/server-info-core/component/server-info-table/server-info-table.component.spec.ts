import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ServerInfoTableComponent} from './server-info-table.component';

describe('ServerInfoTableComponent', () => {
  let component: ServerInfoTableComponent;
  let fixture: ComponentFixture<ServerInfoTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServerInfoTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerInfoTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
