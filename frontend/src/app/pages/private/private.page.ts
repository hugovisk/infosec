import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../services/auth.service';

import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-private',
  templateUrl: './private.page.html',
  styleUrls: ['./private.page.scss'],
})
export class PrivatePage implements OnInit {

  data = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private storage: Storage,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

  loadSpecialInfo() {
    this.authService.getSpecialData().subscribe(res => {
      this.data = res['msg'];
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('login');
  }

  clearToken() {
    // ONLY FOR TESTING!
    this.storage.remove('access_token');

    const toast = this.toastController.create({
      message: 'JWT removed',
      duration: 3000
    });
    toast.then(toast => toast.present());
  }

}

