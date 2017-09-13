# emberfire-phone

Emberfire provider for Authenticate with Firebase with a Phone Number

## Installation

* `git clone <repository-url>` this repository
* `cd emberfire-phone`
* `npm install`

## Using phone auth provider 

```
this.get('session').open('emberfire-phone', {
    provider: 'phone',
    phoneNumber: '+14155552671',
    recaptchaContainer: 'recaptcha',
    invisibleRecaptcha: true
});
```

* `phoneNumber` - The user's E.164 formatted phone number
* `recaptchaContainer` - The ID of an **empty** element in the DOM.
* `invisibleRecaptcha` - True if using invisible captcha.

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
