import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentDetail } from './tournament-detail';

describe('TournamentDetail', () => {
  let component: TournamentDetail;
  let fixture: ComponentFixture<TournamentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
