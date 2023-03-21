import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/* eslint-disable max-len */
/**
 * Translation file for the Spreadsheet module
 */
const flAuthI18nFr: FlLangTranslation = {
  flAuth: {
    password: 'Mot de passe',
    repeat_password: 'Répéter le mot de passe',
    password_forgotten_mail_sent: 'Si cet email est lié a un compte gencovery, nous vous avons envoyé un email pour réinitialiser votre mot de passe',
    forgot_password: 'Mot de passe oublié?',
    password_forgotten: 'Mot de passe oublié',
    password_forgotten_help: 'Entrez votre email pour que nous puissions vous envoyer le lien pour réinitialiser votre mot de passe',
    reset_password: 'Réinitialiser votre mot de passe',
    password_changed: 'Mot de passe modifié',
    sign_in: 'Se connecter',
    logout: 'Se déconnecter',
    signup: 'Inscription',
    password_weak_error: 'Le mot de passe doit contenir au moins 8 caractères, 1 lettre et 1 nombre',
    repeat_password_error: 'Le mot de passe répété dest différent',
    signup_link: 'Vous n\'avez pas de compte? Inscrivez-vous',
    sign_in_link: 'Vous avez déjà un compte? Connectez-vous',
    account_created: 'Compte créé, nous vous avons envoyé un mail pour l\'activer',
    accept_cgu_cgv_text: `J'accepte les <a href="https://gencovery.com/legal/terms-of-use" target="_blank">Conditions générales d'utilisation</a> et la <a href="https://gencovery.com/legal/privacy-policy" target="_blank">politique de confidentialité</a>`,
    accept_cgu_cgv_error: 'Vous devez accepter les conditions pour créer un compte',
    two_fa_code: 'Code de sécurité',
    two_fa: 'Authentification à deux facteurs',
    two_fa_help: 'Entrez le code de sécurité envoyé par email',
    two_fa_cancel: 'Annuler',
    two_fa_invalid_code: 'Code invalide',
    phone_number: 'Numéro de téléphone',
  }
};

const flAuthI18nEn: FlLangTranslation = {
  flAuth: {
    password: 'Password',
    repeat_password: 'Repeat password',
    password_forgotten_mail_sent: 'If this email is linked to a gencovery account, we sent you an email to reset your password',
    forgot_password: 'Forgot password?',
    password_forgotten: 'Password forgotten',
    password_forgotten_help: 'Enter you email account address so we can send you a reset password link',
    reset_password: 'Reset your password',
    password_changed: 'Your password has been changed',
    sign_in: 'Sign in',
    logout: 'Logout',
    signup: 'Sign up',
    password_weak_error: 'The password must contain at least 8 characters, 1 letter and 1 number',
    repeat_password_error: 'The repeat password is not the same',
    signup_link: 'Doesn\'t have an account? Sign up',
    sign_in_link: 'Already have an account? Sign in',
    account_created: 'Account created, we sent you an email to activate your account',
    accept_cgu_cgv_text: `I agree to the website <a href="https://gencovery.com/legal/terms-of-use" target="_blank">Terms of Use</a> and <a href="https://gencovery.com/legal/privacy-policy" target="_blank">Privacy Policy</a>`,
    accept_cgu_cgv_error: 'You must agree to the conditions to create an account',
    two_fa_code: 'Security code',
    two_fa: 'Two factor authentication',
    two_fa_help: 'Enter the security code sent by email',
    two_fa_cancel: 'Cancel',
    two_fa_invalid_code: 'Invalid code',
    phone_number: 'Phone number',
  }
};

export const flAuthI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flAuthI18nEn,
  [ClSupportedLanguage.fr]: flAuthI18nFr
};
