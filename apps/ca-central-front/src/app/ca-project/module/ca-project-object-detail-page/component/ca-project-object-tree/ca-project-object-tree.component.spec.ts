import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectObjectTreeComponent} from './ca-project-object-tree.component';

describe('CaProjectTreeComponent', () => {
  let component: CaProjectObjectTreeComponent;
  let fixture: ComponentFixture<CaProjectObjectTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectObjectTreeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectObjectTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
