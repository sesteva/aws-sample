document.addEventListener("deviceready", function() {}, false);

var AWS_REGION = 'us-east-1';
var COGNITO_IDENTITY_POOL_ID = 'us-east-1:981e4416-c1b3-4052-a6a1-6144b115bb16';
var COGNITO_IDENTITY_ID, COGNITO_SYNC_TOKEN, AWS_TEMP_CREDENTIALS;
var cognitosync;
var COGNITO_SYNC_COUNT;
var COGNITO_DATASET_NAME = 'TEST_DATASET';
var FACEBOOK_APP_ID = '199342603781512';
var FACEBOOK_TOKEN;
var FACEBOOK_USER = {
  id: '',
  first_name: '',
  gender: '',
  last_name: '',
  link: '',
  locale: '',
  name: '',
  timezone: 0,
  updated_time: '',
  verified: false
};
var userLoggedIn = false;

var message = 'AWS Cognito Example App Loaded_____';
var errorMessage = '';

function clearConsole() {
  message = "";
  $('#appConsole').empty().hide();
  errorMessage = "";
  $('#errorConsole').empty().hide();
}

openFB.init({
  appId: FACEBOOK_APP_ID,
  cordova: true
});

function login() {
  openFB.login(
    function(response) {
      if (response.status === 'connected') {
        FACEBOOK_TOKEN = response.authResponse.accessToken;
        message += "Connected to Facebook_____";
        $('#appConsole').text(message).show();
        getInfo();
      } else {
        errorMessage += 'Facebook login failed: ' + response.error + "_____";
        $('#errorConsole').text(errorMessage).show();
      }
    }, {
      scope: 'email,publish_actions'
    });
}

function getInfo() {
  openFB.api({
    path: '/me',
    success: function(data) {
      message += "Logged in with Facebook as " + data.name + "_____";
      $('#appConsole').text(message).show();
      getCognitoID();
    },
    error: errorHandler
  });
}

function logout() {
  openFB.logout(
    function() {
      message += "Logged out of Facebook_____";
      $('#appConsole').text(message).show();
    },
    errorHandler);
}

function revoke() {
  openFB.revokePermissions(
    function() {
      message += "Permissions revoked_____";
      $('#appConsole').text(message).show();
    },
    errorHandler);
}

function errorHandler(error) {
  errorMessage += error.message;
  $('#errorConsole').text(errorMessage).show();
}

function getCognitoID() {
  // The parameters required to intialize the Cognito Credentials object.
  fbmsg = "New Message: " + FACEBOOK_TOKEN;
  $('#appConsole').text(fbmsg).show();
  var params = {
    AccountId: AWS_ACCOUNT_ID,
    RoleArn: IAM_ROLE_ARN, // required
    IdentityPoolId: COGNITO_IDENTITY_POOL_ID, // required
    Logins: {
      'graph.facebook.com': FACEBOOK_TOKEN
    }
  };
  // set the Amazon Cognito region
  AWS.config.region = AWS_REGION;
  // initialize the Credentials object with our parameters
  AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);
  //alert(FACEBOOK_TOKEN);
  // We can set the get method of the Credentials object to retrieve
  // the unique identifier for the end user (identityId) once the provider
  // has refreshed itself
  AWS.config.credentials.get(function(err) {
    if (err) { // an error occurred
      errorMessage += "credentials.get: " + err, err.stack + "_____";
      $('#errorConsole').text(errorMessage).show();
      errorMessage += "AWS.config.credentials: " + JSON.stringify(AWS.config.credentials) + "_____";
      $('#errorConsole').text(errorMessage).show();
    } else {
      AWS_TEMP_CREDENTIALS = AWS.config.credentials;
      AWS_ACCESS_KEY = AWS.config.credentials.accessKeyId;
      AWS_SECRET_KEY = AWS.config.credentials.secretAccessKey;
      COGNITO_IDENTITY_ID = AWS.config.credentials.identityId;
      message += "Cognito Identity Id: " + COGNITO_IDENTITY_ID + "_____";
      $('#appConsole').text(message).show();
      AWS.config.region = "us-east-1";
      //alert(AWS_ACCESS_KEY);
      AWS.config.update({
        credentials: AWS_TEMP_CREDENTIALS
      });

      var bucket = new AWS.S3({
        params: {
          Bucket: 'ddbucketeast'
        }
      });
      bucket.listObjects(function(err, data) {
        if (err) {
          alert(err);
        } else {
          alert(data.Contents.length);
        }
      });
    }
  });
}
