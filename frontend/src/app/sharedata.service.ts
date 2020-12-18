import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable() 

export class ShareService {

    constructor(private http: HttpClient) {}
    share(data: FormData) {
        return this.http.post('/upload', data).toPromise();
    }

}