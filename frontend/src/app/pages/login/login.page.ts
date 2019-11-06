import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
// import { Route } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  credentialsForm: FormGroup;

  hide = true;

  formErrorMessages = {
    'email': [
      { type: 'required', message: 'Insira um email inválido' },
      { type: 'email', message: 'Insira um email com formato inválido' }
    ],
    'password': [
      { type: 'required', message: 'Defina sua senha de acesso' },
      { type: 'minlength', message: 'Necessário mínimo de 4 caracteres' }
    ]
  };

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    public alertController: AlertController

    ) { }

  ngOnInit() {
    this.credentialsForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  get input() {
    return this.credentialsForm.controls;
  }

  getErrorMessage(field) {
    console.log(field);
    for (const error of this.formErrorMessages[field]) {
      console.log(error.type);
      if (this.input[field].hasError(error.type)) {
        return error.message;
      }
    }
  }

  login() {
    this.authService.login(this.credentialsForm.value).subscribe();
    console.log('redirect');
    this.router.navigateByUrl('private');

  }

  register() {
    this.authService.register(this.credentialsForm.value).subscribe(async res => {
      // faz o login apos registrar usuario
      // this.authService.login(this.credentialsForm.value).subscribe();
      const alert = await this.alertController.create({
        header: 'Registro iniciado',
        subHeader: 'Vce tem 2 minutos :)',
        message: 'Acesse seu email e termine o proceso de registro',
        buttons: ['OK']
      });
      await alert.present();
    });
  }

  recoveryPassword() {
    this.authService.recoveryPassword({email: this.input.email.value}).subscribe();
  }

}
