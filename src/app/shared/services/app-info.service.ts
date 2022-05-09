import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

export class Tag {
  id: number;
  depth:number;
  name: string;
  open:boolean;
  attrs : any;
  content : string;
}


@Injectable({  providedIn: 'root' })
export class AppInfoService {

  httpHeader : any = undefined;

  constructor(private http: HttpClient) {

   // this.httpHeader =  new HttpHeaders().set('Content-Type', 'text/xml; charset=utf-8');
    this.httpHeader = this.createHeader('text/xml');
  }

  private createHeader(contentType: string): any {
    return { headers: new HttpHeaders({ 'Content-Type': contentType }), responseType: 'text' };
  }

  public getTypesystemTemplate():any {
    return this.http.get<any>('assets/typesystem-template.xml',this.httpHeader).toPromise();
  }



  public get title() {
    return 'XML---XCAS XMI INCEpTION Converter Generator (prototype)';
  }

  public get currentYear() {
    return new Date().getFullYear();
  }
}
