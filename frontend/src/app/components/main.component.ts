import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import {CameraService} from '../camera.service';
import { ShareService } from '../sharedata.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

	imagePath = '/assets/cactus.png'
	shareForm: FormGroup
	img

	constructor(private cameraSvc: CameraService, private fb: FormBuilder, private shareSvc: ShareService, private authSvc: AuthService) { }

	ngOnInit(): void {

		this.shareForm = this.fb.group({
			"image": this.fb.control('', [Validators.required]),
			"title": this.fb.control('', [Validators.required]),
			"comments": this.fb.control('', [Validators.required])
		})

	  if (this.cameraSvc.hasImage()) {
		  const img = this.cameraSvc.getImage();
		  this.img = img	
		  this.shareForm.patchValue({"image": img.imageAsDataUrl})
		  this.imagePath = img.imageAsDataUrl
	  }

	}

	clear() {
		this.imagePath = '/assets/cactus.png'
		this.shareForm.patchValue({"image": null})
	}


	async share() {
		const values = this.shareForm.value
		const credentials = this.authSvc.getCredentials()
		const formData = new FormData();
    	formData.set('title', values.title);
		formData.set('comments',values.comments);
		formData.set('image', this.img.imageData);
		formData.set('user_id', credentials.user_id);
		formData.set('password', credentials.password)
		try{
			const response = await this.shareSvc.share(formData);
			console.log(response)
		}
		catch(e){
			console.log(e)
		}

	}

}
