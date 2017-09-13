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
        if (!options.phoneNumber || !options.recaptchaContainer) {
            return this.waitFor_(reject(new Error('`phoneNumber` and `recaptchaContainer` must be supplied')));
        }

        var auth = this.get('firebaseApp').auth();
        var recaptchaParams = {};
        if (recaptchaParams.hasOwnProperty('invisibleRecaptcha') && recaptchaParams.invisibleRecaptcha === true) {
            recaptchaParams.size = 'invisible';
        }

        switch (providerId) {
            case 'phone':
                var applicationVerifier = new firebase.auth.RecaptchaVerifier(options.recaptchaContainer, recaptchaParams);
                return this.waitFor_(
                    auth.signInWithPhoneNumber(options.phoneNumber, applicationVerifier)
                        .then(function (confirmationResult) {
                            var verificationCode = window.prompt('Please enter the verification code that was sent to your mobile device.');
                            return confirmationResult.confirm(verificationCode);
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