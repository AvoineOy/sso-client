import _ from 'lodash';

export default class AvoineSSOClient {
  constructor() {
    this.fetchCode = this.fetchCode.bind(this);
    this.requestCode = this.requestCode.bind(this);
    this.validateCode = this.validateCode.bind(this);
    this.handleUseCodeResponse = this.handleUseCodeResponse.bind(this);
  }

  /**
   * Request code for logging into SSO
   * 
   * @param {string} ssoUrl 
   * @param {string} ssoInstance 
   * @param {string} loginString 
   * @returns {Promise}
   * @memberof AvoineSSOClient
   */
  requestCode(ssoUrl, ssoInstance, loginString) {
    return new Promise((resolve, reject) => {
      if (_.isEmpty(loginString)) {
        reject('EMPTY_SENSE_CODE');
        return;
      }

      this.fetchCode(ssoUrl, ssoInstance, loginString)
        .then(response => this.getAvoineHashFromResponse(response))
        .then(hash => resolve(hash))
        .catch(err => reject(err));
    });
  }

  /**
   * Fetch code from SSO
   * 
   * @param {string} ssoUrl 
   * @param {string} ssoInstance 
   * @param {string} loginString 
   * @returns {Promise<Response>}
   * @memberof AvoineSSOClient
   */
  fetchCode(ssoUrl, ssoInstance, loginString) {
    const url = this.getCodeUrl(ssoUrl, ssoInstance, loginString);
    console.log('Fetch', url);
    return fetch(url);
  }

  /**
   * Dig hash from fetch::response
   * 
   * @param {Response} response
   * @returns {Promise<string>}
   * @memberof AvoineSSOClient
   */
  getAvoineHashFromResponse(response) {
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

  /**
   * Validate login code
   * 
   * @param {string} ssoUrl 
   * @param {string} ssoInstance 
   * @param {stringi} code 
   * @param {string} hash 
   * @returns {Promise<string>}
   * @memberof AvoineSSOClient
   */
  validateCode(ssoUrl, ssoInstance, code, hash) {
    return new Promise((resolve, reject) => {

      console.log('Validating code', code, 'with hash', hash);

      if (_.isEmpty(code)) {
        reject('Code missing');
        return;
      }

      const url = this.getUseUrl(ssoUrl, ssoInstance, code, hash);
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
        });
    });
  }

  /**
   * Validate if Response contains header X-Avoine-Token
   * 
   * If so, return content of that header.
   * 
   * @param {Response} response 
   * @returns {Promise<string>}
   * @memberof AvoineSSOClient
   */
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

  /**
   * Get url for fetching the code
   * 
   * @param {string} url 
   * @param {string} instance 
   * @param {string} loginString 
   * @returns {string}
   * @memberof AvoineSSOClient
   */
  getCodeUrl(url, instance, loginString) {
    return `${url}/codes/get/${instance}/?s=${loginString}`;
  }

  /**
   * Get url for using the code
   * 
   * @param {string} url 
   * @param {string} instance 
   * @param {string} code 
   * @param {string} hash 
   * @returns {string}
   * @memberof AvoineSSOClient
   */
  getUseUrl(url, instance, code, hash) {
    return `${url}/codes/use/${instance}/?code=${code}&hash=${hash}`;
  }
}