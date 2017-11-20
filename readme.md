# @avoine/sso-client
---

## Install

Install Avoine Mobile Components with

`npm install --save @avoine/sso-client`


## Usage
---

```
import AvoineSSOClient from '@avoine/sso-client'

const ssoClient = new AvoineSSOClient()

ssoClient.requestCode('https://url.to.sso', 'instance', '0411234567')

ssoClient.validateCode('https://url.to.sso', 'instance', '123456', 'hash')
```