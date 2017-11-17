import _ from 'lodash';

export default class AvoineSSOClient {
  constructor(avoineSSOUrl, instanceName) {
    this.avoineSSOUrl = avoineSSOUrl;
    this.instanceName = instanceName;

    this.fetchCode = this.fetchCode.bind(this);
    this.requestCode = this.requestCode.bind(this);
    this.validateCode = this.validateCode.bind(this);
    this.handleUseCodeResponse = this.handleUseCodeResponse.bind(this);
  }

  requestCode(loginString) {
    return new Promise((resolve, reject) => {
      if (_.isEmpty(loginString)) {
        reject('EMPTY_SENSE_CODE');
        return;
      }

      this.fetchCode(loginString)
        .then(response => this.getAvoineHashFromResponse(response))
        .then(hash => resolve(hash))
        .catch(err => reject(err));
    });
  }

  fetchCode(loginString) {
    const url = this.getCodeUrl(loginString);
    console.log('Fetch', url);
    return fetch(url);
  }

  getAvoineHashFromResponse(response) {
    console.log(response);
    return new Promise((resolve, reject) => {
      /**
       * Avoine SSO returns always a hash. This is to prevent
       * finding out which phone numbers are found in registry.
       */
      const avoineHash = response.headers.get('X-Avoine-Hash');

      if (_.isEmpty(avoineHash)) {
        console.log('Hash not found');
        reject('Hash not found');
        return;
      }

      console.log('Got hash', avoineHash);
      resolve(avoineHash);
    });
  }

  validateCode(code, hash) {
    return new Promise((resolve, reject) => {

      console.log('Validating code', code, 'with hash', hash);

      if (_.isEmpty(code)) {
        reject('Syötä koodi');
        return;
      }

      const url = this.getUseUrl(code, hash);
      console.log('Fetch', url);

      fetch(url)
        .then(response => this.handleUseCodeResponse(response))
        .then(token => {
          console.log('Got authentication token:', token);
          resolve(token);
        })
        .catch(err => {
          console.log('Validation failed:', err);
          reject(err);
        })
      ;
    });
  }

  handleUseCodeResponse(response) {
    return new Promise((resolve, reject) => {
      if (response && response.ok) {
        resolve(response.headers.get('X-Avoine-Token'));
      } else {
        // response.text().then(reason => reject(reason));
        reject('Reponse is not ok');
      }
    });
  }

  getCodeUrl(loginString) {
    return `${this.avoineSSOUrl}/codes/get/${this.instanceName}/?s=${loginString}`;
  }

  getUseUrl(code, hash) {
    return `${this.avoineSSOUrl}/codes/use/${this.instanceName}/?code=${code}&hash=${hash}`;
  }
}