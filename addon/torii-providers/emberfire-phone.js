import Ember from 'ember';
import firebase from 'firebase';
import Waitable from 'emberfire/mixins/waitable';

export default Ember.Object.extend(Waitable, {
    name: 'emberfire-phone',
    firebaseApp: Ember.inject.service(),

    open(options) {
        var providerId = options.provider;
        var reject = Ember.RSVP.reject;

        if (!providerId) {
            return reject(new Error('`provider` must be supplied'));
        }
        if (!options.hasOwnProperty('phoneNumber') || !options.hasOwnProperty('recaptcha')) {
            return this.waitFor_(reject(new Error('`phoneNumber` and `recaptcha` must be supplied')));
        }
        if (!options.recaptcha.hasOwnProperty('container')) {
            return this.waitFor_(reject(new Error('`recaptcha.container` must be supplied')));
        }

        var auth = this.get('firebaseApp').auth();
        var recaptchaParams = {};
        if (options.recaptcha.hasOwnProperty('invisible') && options.recaptcha.invisible === true) {
            recaptchaParams.size = 'invisible';
        }


        switch (providerId) {
            case 'phone':
                var renderPromise = Ember.RSVP.Promise.resolve(true);
                var applicationVerifier = this.get('RecaptchaVerifier');
                if (Ember.isEmpty(applicationVerifier)) {
                    applicationVerifier = new firebase.auth.RecaptchaVerifier(options.recaptcha.container, recaptchaParams);
                    this.set('RecaptchaVerifier', applicationVerifier);
                    renderPromise = applicationVerifier.render()
                        .then((widgetId) => {
                            this.set('recaptchaWidgetId', widgetId);
                        });
                }
                return this.waitFor_(
                    renderPromise
                        .then(() => {
                            return auth.signInWithPhoneNumber(options.phoneNumber, applicationVerifier)
                        })
                        .then(function (confirmationResult) {
                            var verificationCode = window.prompt('Please enter the verification code that was sent to your mobile device.');
                            return confirmationResult.confirm(verificationCode);
                        })
                        .catch((err) => {
                            grecaptcha.reset(this.get('recaptchaWidgetId'));
                            return Ember.RSVP.reject(err);
                        })
                );
                break;
        }
    },
    /**
     * Wraps a promise in test waiters.
     *
     * @param {!Promise} promise
     * @return {!Promise}
     */
    waitFor_(promise) {
        this._incrementWaiters();
        return promise.then((result) => {
            this._decrementWaiters();
            if (result.user) {
                return result.user;
            }
            return result;
        }).catch((err) => {
            this._decrementWaiters();
            return Ember.RSVP.reject(err);
        });
    }
});