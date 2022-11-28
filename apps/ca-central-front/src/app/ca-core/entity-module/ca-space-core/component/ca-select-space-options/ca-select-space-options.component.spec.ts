import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectSpaceOptionsComponent} from './ca-select-space-options.component';

describe('CaSelectSpaceOptionsComponent', () => {
  let component: CaSelectSpaceOptionsComponent;
  let fixture: ComponentFixture<CaSelectSpaceOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectSpaceOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSelectSpaceOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
