import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable() 

export class AuthService {

    constructor(private http: HttpClient) {}
    user_id = ''
    password = ''


    //Methods
    authUser(form_values) {

        const headers = new HttpHeaders().set('Content-Type', "application/x-www-form-urlencoded")
        const params = new HttpParams().set("user_id", form_values.user_id).set("password", form_values.password);
        return this.http.post('/login', params.toString(), {headers}).toPromise()

    }

    storeCredentials(credentials) {
        this.user_id = credentials.user_id;
        this.password = credentials.password
    }

    getCredentials() {
        return {user_id: this.user_id, password: this.password}
    }

}