import { Injectable } from "@angular/core";
import { FlApiService } from "@monorepo/front-core-lib"
import { Observable } from "rxjs";
import { Documentation } from "../model/entities/da-documentation.class";

/**
 * Service to manage documentation entity
 */
@Injectable({
    providedIn: 'root'
})
export class DaDocumentationService {

    private readonly route: string = 'documentation';
    constructor(private apiService: FlApiService){

    }

    /**
   * Call http create
   * @param object json object
   */
    public create(object: Partial<Documentation>): Observable<Documentation> {
        return this.apiService.post(this.route, object, Documentation, {serialization: Documentation});
    }

    /**
   * Call http get one by id
   * @param id id of the entity
   */
     public getById(id: string): Observable<Documentation> {
        return this.apiService.getById(this.route, id, Documentation);
    }

    /**
   * Call http get
   */
     public get(): Observable<Documentation> {
        return this.apiService.get(this.route, Documentation);
    }

    /**
   * Call http update
   * @param object json object
   */
     public update(object: Partial<Documentation>): Observable<Documentation> {
        return this.apiService.put(this.route, object, Documentation, {serialization: Documentation});
    }

    /**
   * Call http delete
   * @param id id of the entity
   */
     public deleteById(id: string): Observable<Documentation> {
        return this.apiService.deleteById(this.route, id, Documentation);
    }
}