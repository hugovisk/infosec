import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AlertController } from '@ionic/angular';
import { PasswordValidator } from './password-validator/password-validator.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {

  credentialsForm: FormGroup;

  hide = true;
  hideNew = true;
  hideConfirm = true;

  strenghtPassword;
  strenghtBarValue = 0;
  strenghtBarColor: string;

  formErrorMessages = {
    'email': [
      { type: 'required', message: 'Insira um email inválido' },
      { type: 'email', message: 'Insira um email com formato inválido' }
    ],
    'password': [
      { type: 'required', message: 'Digite uma senha' },
      { type: 'minlength', message: 'Necessário mínimo de 4 caracteres' },
      { type: 'pattern', message: 'Deve conter pelo menos uma minuscula, uma maiuscula e um numero' }
    ],
    'passwordNew': [
      { type: 'required', message: 'Digite uma senha' },
      { type: 'minlength', message: 'Necessário mínimo de 4 caracteres' },
      { type: 'pattern', message: 'Deve conter pelo menos uma minuscula, uma maiuscula e um numero' }
    ]
  };

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private helper: JwtHelperService,
    public alertController: AlertController
    ) { }

  ngOnInit() {
    this.credentialsForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      passwordNew: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')
      ]],
      passwordNewConfirm: ['', [Validators.required, Validators.minLength(4)]],
    });

    this.checkEmailToken();
  }

  get input() {
    return this.credentialsForm.controls;
  }

  getErrorMessage(field) {
    // console.log(field);
    for (const error of this.formErrorMessages[field]) {
      console.log(error.type);
      if (this.input[field].hasError(error.type)) {
        return error.message;
      }
    }
  }

  resetPassword() {
    console.log(this.credentialsForm.value);
    this.authService.resetPassword(this.credentialsForm.value).subscribe(res => {
      // faz o login apos registrar usuario
      // this.authService.login(this.credentialsForm.value).subscribe();
    });
  }

  passwordChecker(password) {
    let strenght = 0;
    if (password.length > 4) {
      if (password.match(/[a-z]+/)) {
        strenght += 1;
      }
      if (password.match(/[A-Z]+/)) {
        strenght += 1;
      }
      // if (password.match(/[" !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"]+/)) {
      //   strenght += 1;
      // }
      if (password.match(/[0-9]+/)) {
        strenght += 1;
      }
      if (password.length > 5) {
        strenght += 1;
      }
    }
    switch (strenght) {
      case 0:
        this.strenghtBarValue = 15;
        this.strenghtPassword = 'Fraco';
        this.strenghtBarColor = 'warn';
        break;
      case 1:
        this.strenghtBarValue = 30;
        this.strenghtPassword = 'Fraco';
        this.strenghtBarColor = 'warn';
        break;
      case 2:
        this.strenghtBarValue = 45;
        this.strenghtPassword = 'Medio';
        this.strenghtBarColor = 'accent';
        break;
      case 3:
        this.strenghtBarValue = 70;
        this.strenghtPassword = 'Medio';
        this.strenghtBarColor = 'accent';
        break;
      case 4:
        this.strenghtBarValue = 100;
        this.strenghtPassword = 'Forte';
        this.strenghtBarColor = 'primary';
        break;
    }
  }

  checkEmailToken() {
  this.route.queryParams.subscribe(async params => {
    const emailToken = params.token;
    // console.log(emailToken);
    if (emailToken) {
      const decoded = this.helper.decodeToken(emailToken);
      const isExpired = this.helper.isTokenExpired(emailToken);
      console.log(decoded);
      console.log(isExpired);
      if (isExpired) {
        const alert = await this.alertController.create({
          header: 'EXPIROU',
          subHeader: 'Acabou o tempo :(',
          message: 'Reinicie o processo de registro',
          buttons: ['OK']
        });
        await alert.present();
        
      //   // redirect to expired page
      } else {
          this.input.email.setValue(decoded.email);

      }
    }
});


}

async presentAlert() {
  const alert = await this.alertController.create({
    header: 'Alert',
    subHeader: 'Subtitle',
    message: 'This is an alert message.',
    buttons: ['OK']
  });

  await alert.present();
}


}
