import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ServerInfoCardComponent} from './server-info-card.component';

describe('ServerInfoCardComponent', () => {
  let component: ServerInfoCardComponent;
  let fixture: ComponentFixture<ServerInfoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServerInfoCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
