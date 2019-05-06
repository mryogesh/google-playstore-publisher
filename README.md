# google-playstore-publisher 

 > Upload APKs to Google Play with api or cli (command line)

This package offers api and cli tool to publish apk in the Google Play Store


## Authentication

Steps to get your service account file from Google Cloud Platform

- Go to your GCP Project https://console.cloud.google.com/iam-admin/serviceaccounts (Create gcp project if you don't have one)
- Create service account (In 3rd step you will get option to create the key), store that key, that will be used to upload apk to playstore 
- Go to https://play.google.com/apps/publish
- Go to Settings -> Developer account -> API access
- Now, Grant permission to service account we created (Choose role as a release manager) -> click Add user

> It can take upto 24 hours to grant permission to service account, so don't worry if you get authentication error


## Install

```
npm install -g google-playstore-publisher
```

or

```
yarn global add google-playstore-publisher
```

## Usage

Use the CLI

```bash
playstore \ 
    -t=internal \ # values can be (internal, alpha, beta, production)
    -p=com.example.android \
    -k=playstore_service_account.json \ 
    -a=./app-release.apk
```

or the JavaScript API

```javascript
const playstore = require('google-playstore-publisher');
const path = require('path');

try {
    const data = await playstore.publish({
      keyFilePath: path.join(
        __dirname,
        '../../../playstore-service-account.json'
      ),
      packageName: 'com.example.android',
      track: 'internal', // value (internal, alpha, beta, production)
      apkFilePath: path.join(__dirname, '../../../app-release.apk')
    });
    console.log(data);
} catch (e) {
  console.log(e);
}
```