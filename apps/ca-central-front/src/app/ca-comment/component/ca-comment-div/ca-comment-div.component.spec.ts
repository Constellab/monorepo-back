import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaCommentDivComponent } from './ca-comment-div.component';

describe('CaCommentDivComponent', () => {
  let component: CaCommentDivComponent;
  let fixture: ComponentFixture<CaCommentDivComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCommentDivComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCommentDivComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
