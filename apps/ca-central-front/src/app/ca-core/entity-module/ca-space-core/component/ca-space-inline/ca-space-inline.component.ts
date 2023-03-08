import {Component, Input, OnInit} from '@angular/core';
import {CaSpace} from '../../../../model/entities/space/ca-space.class';
import {CaNotificationState} from '../../../../state/ca-notification.state';

@Component({
  selector: 'ca-space-inline',
  templateUrl: './ca-space-inline.component.html',
  styleUrls: ['./ca-space-inline.component.scss']
})
export class CaSpaceInlineComponent implements OnInit {

  @Input() space: CaSpace;
  nbNotif: number | string = '';

  @Input() showNotif: boolean = false;

  constructor(private notificationState: CaNotificationState) {
  }

  ngOnInit(): void {
    if (this.showNotif)
      this.notificationState.getSpaceUserNotificationsNumber(this.space.id).subscribe((number) => {
        this.nbNotif = number;
      });
  }

}
