import {Component, OnInit} from '@angular/core';
import {BioxResourceService} from '../../../../../core/entity-service/biox-resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {BioxResourceVM} from '../../../../../core/model/entities/biox-resource.entity';
import {first, tap} from 'rxjs/operators';

interface View {
  route: string;
  icon?: string;
  text?: string;
  tooltip: string;
}

const jsonView: View = {route: 'json', text: '{ }', tooltip: 'biox.resource_view_json'};
const spreadsheetView: View = {route: 'spreadsheet', icon: 'calendar_view_month', tooltip: 'biox.resource_view_spreadsheet'};
const pathwayView: View = {route: 'pathway', icon: 'share', tooltip: 'biox.resource_view_pathway'};

@Component({
  selector: 'gen-biox-resource-detail-page',
  templateUrl: './biox-resource-detail-page.component.html',
  styleUrls: ['./biox-resource-detail-page.component.scss']
})
export class BioxResourceDetailPageComponent implements OnInit {

  resourceId: string;
  resource$: Observable<BioxResourceVM>;

  availableViews: View[];
  currentView?: string;

  constructor(private resourceService: BioxResourceService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.route.params.pipe(first()).subscribe(
      params => this.init(params.id)
    );

    this.route.queryParams.subscribe(
      params => this.currentView = params.view
    );
  }

  private init(id: string): void {
    this.resourceId = id;
    this.resource$ = this.resourceService.getById(id).pipe(
      tap(resource => this.initViews(resource))
    );
  }

  private initViews(resource: BioxResourceVM): void {
    this.availableViews = [jsonView, spreadsheetView];
    let defaultView: View = this.availableViews[0];

    // if the resource is a network, add the network view and set it by default
    if (resource.model.type === 'gena.network.Network') {
      this.availableViews.push(pathwayView);
      defaultView = pathwayView;
    }


    if (this.currentView == null) {
      // init the first mode if there is not mode selected
      this.router.navigate(['./'], {
        relativeTo: this.route,
        queryParams: this.getQueryParam(defaultView),
        replaceUrl: true
      });
    }
  }

  getQueryParam(view: View): { view: string } {
    return {view: view.route};
  }

}
