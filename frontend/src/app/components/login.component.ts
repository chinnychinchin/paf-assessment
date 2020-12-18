import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  errorMessage = ''
  loginForm: FormGroup
  
	constructor(private authSvc: AuthService, private fb: FormBuilder, private router: Router) { }

	ngOnInit(): void { 

    this.loginForm = this.fb.group({
      "user_id": this.fb.control('', [Validators.required]),
      "password": this.fb.control('', [Validators.required]),
    })

  }


  async process() {
    
    try{
      const response = await this.authSvc.authUser(this.loginForm.value);
      this.authSvc.storeCredentials(this.loginForm.value)
      this.router.navigate(["/main"])
    }
    catch(e){
      console.log(e)
      this.errorMessage = e['error'].message
    }
    
  }

}
