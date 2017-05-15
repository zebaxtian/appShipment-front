import { Injectable } from "@angular/core";
import {Http, Response, Headers, RequestOptions} from "@angular/http";
import 'rxjs/RX';

@Injectable()
export class AppShipmentService {

  private url:String = "http://localhost:9000";

  constructor (private http:Http){}

  login(data){
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions ({ headers: headers });
    return this.http.post(this.url+"/login", data, options).map(
      (response:Response) => {
        const data = response.json();
        return data;
      }
    );
  }

  getTransporters(data){
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions ({ headers: headers });
    return this.http.post(this.url+"/transportadores/location", data, options).map(
      (response:Response) => {
        const data = response.json();
        return data;
      }
    );
  }

  createService(data){
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions ({ headers: headers });
    return this.http.post(this.url+"/servicios/crear", data, options).map(
      (response:Response) => {
        const data = response.json();
        return data;
      }
    );
  }

}
