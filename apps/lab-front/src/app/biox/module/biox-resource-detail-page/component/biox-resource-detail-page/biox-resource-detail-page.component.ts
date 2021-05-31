import {Component, OnInit} from '@angular/core';
import {BioxResourceService} from '../../../../../core/entity-service/biox-resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {BioxResource} from '../../../../../core/model/entities/biox-resource.entity';
import {first, tap} from 'rxjs/operators';
import {FileResourcePreview} from '../../../../../core/model/entities/file-resource.entity';

interface View {
  route: string;
  icon?: string;
  text?: string;
  tooltip: string;
}

const jsonView: View = {route: 'json', text: '{ }', tooltip: 'biox.resource_view_json'};
const plainTextView: View = {route: 'text', icon: 'text_snippet', tooltip: 'biox.resource_view_text'};
const spreadsheetView: View = {route: 'spreadsheet', icon: 'calendar_view_month', tooltip: 'biox.resource_view_spreadsheet'};
const pathwayView: View = {route: 'pathway', icon: 'share', tooltip: 'biox.resource_view_pathway'};
const imageView: View = {route: 'image', icon: 'insert_photo', tooltip: 'biox.resource_view_image'};

@Component({
  selector: 'gen-biox-resource-detail-page',
  templateUrl: './biox-resource-detail-page.component.html',
  styleUrls: ['./biox-resource-detail-page.component.scss']
})
export class BioxResourceDetailPageComponent implements OnInit {

  resourceId: string;
  resource$: Observable<BioxResource>;

  availableViews: View[];
  currentView?: string;

  constructor(private resourceService: BioxResourceService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.route.params.pipe(first()).subscribe(
      params => this.init(params.type, params.id)
    );

    this.route.queryParams.subscribe(
      params => this.currentView = params.view
    );
  }

  private init(type: string, id: string): void {
    this.resourceId = id;
    this.resource$ = this.resourceService.getByTypeAndId(type, id).pipe(
      tap(resource => this.initViews(resource))
    );
  }

  private initViews(resource: BioxResource): void {
    let defaultView: View;

    // if the resource is a network, add the network view and set it by default
    if (resource.type === 'gena.network.Network') {
      this.availableViews = [pathwayView, jsonView, spreadsheetView, plainTextView];
      defaultView = pathwayView;
    } else if (resource instanceof FileResourcePreview && resource.isImage()) {
      this.availableViews = [imageView, spreadsheetView, plainTextView];
      defaultView = imageView;
    } else if (resource instanceof FileResourcePreview && resource.getExtension() === 'csv') {
      this.availableViews = [jsonView, spreadsheetView, plainTextView];
      defaultView = spreadsheetView;
    } else if (typeof resource.data === 'string') {
      this.availableViews = [jsonView, spreadsheetView, plainTextView];
      defaultView = plainTextView;
    } else {
      this.availableViews = [jsonView, spreadsheetView, plainTextView];
      defaultView = jsonView;
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
