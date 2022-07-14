# typeo

## Initial Setup
First, ensure that you have node installed on your machine.

Get started by cloning the repository on your machine

`git clone https://github.com/laroccol/typeo`

Navigate to the root directory of the project and run the following command:

`npm install`

Then, navigate to the `/client` directory and again install dependencies with the following command:

`cd client && npm install`

Next, navigate to `https://firebase.google.com/` and click the `Go to Console` button in the top right corner of your browser.
Select `Add project` and name it typeo. Leave Google Analytics enabled and click `Continue`. For your Google Analytics account,
choose "Default for Firebase."

Once your project is ready you need to enable Authentication and Cloud Firestore. Start by clicking on the Authentication
card in the "Project Overview" screen. Then, click `Get Started` and enable Email/Password providers. This is all for auth.

Next, return to the "Project Overview" page and click on the Cloud Firestore card. Click `Create database` and choose to start
in test mode. Then, choose the server closest to your location.

Now you have to set up your .env files in order to access Firebase. Begin by creating a .env file in the `/client` directory.
Back on the "Project Overview" screen in Firebase, add a web app \(has icon \</\>\). Give your web app a nickname \(typeo\)
and click `Register App`. Then, populate your `.env` file in the `/client` directory with the following variables from
the initialization script provided by Firebase:

```
REACT_APP_FIREBASE_API_KEY=apiKey
REACT_APP_FIREBASE_AUTH_DOMAIN=authDomain
REACT_APP_FIREBASE_PROJECT_ID=projectId
REACT_APP_FIREBASE_STORAGE_BUCKET=storageBucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=messagingSenderId
REACT_APP_FIREBASE_APP_ID=appId
```

Note: replace the values on the right side of the equals sign with the corresponding value in the firebaseConfig object 
provided during web app setup. DO NOT use quotes around the variables. For example, this is wrong:

`REACT_APP_FIREBASE_API_KEY="IzaSyCfG09gpKHwGGnQ3Zvn_O_93IJj"`

This is right:

`REACT_APP_FIREBASE_API_KEY=IzaSyCfG09gpKHwGGnQ3Zvn_O_93IJj`

Once this is complete, click `Continue to console` to return to the "Project Overview" page. Next, navigate to the
project settings page \(the button is right next to "Project Overview"\). From here, go to the "Service accounts" tab and
click `Generate new private key`. Create another `.env` file in the root directory of the project, and fill it out in the
same manner as before:

```
FIREBASE_PROJECT_ID=project_id
FIREBASE_PRIVATE_KEY_ID=private_key_id
FIREBASE_PRIVATE_KEY=private_key
FIREBASE_CLIENT_EMAIL=client_email
FIREBASE_CLIENT_ID=client_id
FIREBASE_CLIENT_X509_CERT_URL=client_x509_cert_url
```

Note: the private key needs to be of the form `-----BEGIN PRIVATE KEY-----\nPRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n`.
This completes the Firebase and app setup.

## Running the app
First, you need to start the server. Open a terminal window and navigate to the root directory of the project. Run the following command:

`npm run devnb`

This will start the development server. Then, in a separate terminal window, navigate to the `/client` directory and run the following command:

`npm run start`

Everything should be running and you are good to start developing!


