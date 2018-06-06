/* CoreRecipes.js
 *
 * Simple script that demonstrates how to accomplish various REST API use-cases.
 */

var docusign = require('docusign-esign');

// Note: Following values are class members for readability and easy testing
// TODO: Enter your DocuSign credentials
var UserName = '[EMAIL]';
var Password = '[PASSWORD]';

// TODO: Enter your Integrator Key (aka API key), created through your developer sandbox preferences
var IntegratorKey = '[INTEGRATOR_KEY]';

// for production environment update to 'www.docusign.net/restapi'
var BaseUrl = 'https://demo.docusign.net/restapi';

/* ****************************************************************************************************************
* RequestSignatureOnDocument()
*
* This recipe demonstrates how to request a signature on a document by first making the
* Login API call then the Create Envelope API call.
******************************************************************************************************************/
var RequestSignatureOnDocument = function () {
  // TODO: Enter signer information and path to a test file
  var signerName = '[SIGNER_NAME]';
  var signerEmail = '[SIGNER_EMAIL]';

  // point to a local document for testing
  var SignTest1File = '[PATH/TO/DOCUMENT/TEST.PDF]';

  // initialize the api client
  var apiClient = new docusign.ApiClient();
  apiClient.setBasePath(BaseUrl);

  // create JSON formatted auth header
  var creds = '{"Username":"' + UserName + '","Password":"' + Password + '","IntegratorKey":"' + IntegratorKey + '"}';
  apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);

  // assign api client to the Configuration object
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  // ===============================================================================
  // Step 1:  Login() API
  // ===============================================================================
  // login call available off the AuthenticationApi
  var authApi = new docusign.AuthenticationApi();

  // login has some optional parameters we can set
  var loginOps = new authApi.LoginOptions();
  loginOps.setApiPassword('true');
  loginOps.setIncludeAccountIdGuid('true');
  authApi.login(loginOps, function (error, loginInfo, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }

    if (loginInfo) {
      // list of user account(s)
      // note that a given user may be a member of multiple accounts
      var loginAccounts = loginInfo.getLoginAccounts();
      console.log('LoginInformation: ' + JSON.stringify(loginAccounts));

      // ===============================================================================
      // Step 2:  Create Envelope API (AKA Signature Request)
      // ===============================================================================

      // create a byte array that will hold our document bytes
      var fileBytes = null;
      try {
        var fs = require('fs');
        var path = require('path');
        // read file from a local directory
        fileBytes = fs.readFileSync(path.resolve(__dirname, SignTest1File));
      } catch (ex) {
        // handle error
        console.log('Exception: ' + ex);
      }

      // create an envelope that will store the document(s), field(s), and recipient(s)
      var envDef = new docusign.EnvelopeDefinition();
      envDef.setEmailSubject('Please sign this document sent from Node SDK)');

      // add a document to the envelope
      var doc = new docusign.Document();
      var base64Doc = Buffer.from(fileBytes).toString('base64');
      doc.setDocumentBase64(base64Doc);
      doc.setName('TestFile.pdf'); // can be different from actual file name
      doc.setDocumentId('1');

      var docs = [];
      docs.push(doc);
      envDef.setDocuments(docs);

      // add a recipient to sign the document, identified by name and email we used above
      var signer = new docusign.Signer();
      signer.setEmail(signerEmail);
      signer.setName(signerName);
      signer.setRecipientId('1');

      // create a signHere tab somewhere on the document for the signer to sign
      // default unit of measurement is pixels, can be mms, cms, inches also
      var signHere = new docusign.SignHere();
      signHere.setDocumentId('1');
      signHere.setPageNumber('1');
      signHere.setRecipientId('1');
      signHere.setXPosition('100');
      signHere.setYPosition('100');

      // can have multiple tabs, so need to add to envelope as a single element list
      var signHereTabs = [];
      signHereTabs.push(signHere);
      var tabs = new docusign.Tabs();
      tabs.setSignHereTabs(signHereTabs);
      signer.setTabs(tabs);

      // add recipients (in this case a single signer) to the envelope
      envDef.setRecipients(new docusign.Recipients());
      envDef.getRecipients().setSigners([]);
      envDef.getRecipients().getSigners().push(signer);

      // send the envelope by setting |status| to "sent". To save as a draft set to "created"
      envDef.setStatus('sent');

      // use the |accountId| we retrieved through the Login API to create the Envelope
      var loginAccount = new docusign.LoginAccount();
      loginAccount = loginAccounts[0];
      var accountId = loginAccount.accountId;

      // instantiate a new EnvelopesApi object
      var envelopesApi = new docusign.EnvelopesApi();

      // call the createEnvelope() API
      envelopesApi.createEnvelope(accountId, envDef, null, function (error, envelopeSummary, response) {
        if (error) {
          console.log('Error: ' + error);
          return;
        }

        if (envelopeSummary) {
          console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
        }
      });
    }
  });
}; // end RequestSignatureOnDocument()

/* ****************************************************************************************************************
* RequestSignatureFromTemplate()
*
* This recipe demonstrates how to request a signature from a template in your account.  Templates are design-time
* objects that contain documents, tabs, routing, and recipient roles.  To run this recipe you need to provide a
* valid templateId from your account along with a role name that the template has configured.
******************************************************************************************************************/
var RequestSignatureFromTemplate = function () {
  // TODO: Enter signer information and template info from a template in your account
  var signerName = '[SIGNER_NAME]';
  var signerEmail = '[SIGNER_EMAIL]';
  var templateId = '[TEMPLATE_ID]';
  var templateRoleName = '[TEMPLATE_ROLE_NAME]';

  // initialize the api client
  var apiClient = new docusign.ApiClient();
  apiClient.setBasePath(BaseUrl);

  // create JSON formatted auth header
  var creds = '{"Username":"' + UserName + '","Password":"' + Password + '","IntegratorKey":"' + IntegratorKey + '"}';
  apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);

  // assign api client to the Configuration object
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  // ===============================================================================
  // Step 1:  Login() API
  // ===============================================================================
  // login call available off the AuthenticationApi
  var authApi = new docusign.AuthenticationApi();

  // login has some optional parameters we can set
  var loginOps = new authApi.LoginOptions();
  loginOps.setApiPassword('true');
  loginOps.setIncludeAccountIdGuid('true');
  authApi.login(loginOps, function (error, loginInfo, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }

    if (loginInfo) {
      // list of user account(s)
      // note that a given user may be a member of multiple accounts
      var loginAccounts = loginInfo.getLoginAccounts();
      console.log('LoginInformation: ' + JSON.stringify(loginAccounts));

      // ===============================================================================
      // Step 2:  Create Envelope API (AKA Signature Request) from a Template
      // ===============================================================================

      // create a new envelope object that we will manage the signature request through
      var envDef = new docusign.EnvelopeDefinition();
      envDef.setEmailSubject('Please sign this document sent from Node SDK)');
      envDef.setTemplateId(templateId);

      // create a template role with a valid templateId and roleName and assign signer info
      var tRole = new docusign.TemplateRole();
      tRole.setRoleName(templateRoleName);
      tRole.setName(signerName);
      tRole.setEmail(signerEmail);

      // create a list of template roles and add our newly created role
      var templateRolesList = [];
      templateRolesList.push(tRole);

      // assign template role(s) to the envelope
      envDef.setTemplateRoles(templateRolesList);

      // send the envelope by setting |status| to "sent". To save as a draft set to "created"
      envDef.setStatus('sent');

      // use the |accountId| we retrieved through the Login API to create the Envelope
      var loginAccount = new docusign.LoginAccount();
      loginAccount = loginAccounts[0];
      var accountId = loginAccount.accountId;

      // instantiate a new EnvelopesApi object
      var envelopesApi = new docusign.EnvelopesApi();

      // call the createEnvelope() API
      envelopesApi.createEnvelope(accountId, envDef, null, function (error, envelopeSummary, response) {
        if (error) {
          console.log('Error: ' + error);
          return;
        }

        if (envelopeSummary) {
          console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
        }
      });
    }
  });
}; // end RequestSignatureFromTemplate()

/* ****************************************************************************************************************
* GetEnvelopeInformation()
*
* This recipe demonstrates how to retrieve real-time envelope information for an existing envelope.  Note that
* DocuSign has certain platform rules in place which limit how frequently you can poll for status on a given
* envelope.  As of this writing the current limit is once every 15 minutes for a given envelope.
******************************************************************************************************************/
var GetEnvelopeInformation = function () {
  // TODO: Enter envelopeId of an envelope you have access to (i.e. you sent the envelope or you're an account admin)
  var envelopeId = '[ENVELOPE_ID]';

  // initialize the api client
  var apiClient = new docusign.ApiClient();
  apiClient.setBasePath(BaseUrl);

  // create JSON formatted auth header
  var creds = '{"Username":"' + UserName + '","Password":"' + Password + '","IntegratorKey":"' + IntegratorKey + '"}';
  apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);

  // assign api client to the Configuration object
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  // ===============================================================================
  // Step 1:  Login() API
  // ===============================================================================
  // login call available off the AuthenticationApi
  var authApi = new docusign.AuthenticationApi();

  // login has some optional parameters we can set
  var loginOps = new authApi.LoginOptions();
  loginOps.setApiPassword('true');
  loginOps.setIncludeAccountIdGuid('true');
  authApi.login(loginOps, function (error, loginInfo, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }

    if (loginInfo) {
      // list of user account(s)
      // note that a given user may be a member of multiple accounts
      var loginAccounts = loginInfo.getLoginAccounts();
      console.log('LoginInformation: ' + JSON.stringify(loginAccounts));

      // ===============================================================================
      // Step 2:  Get Envelope API
      // ===============================================================================

      // use the |accountId| we retrieved through the Login API to access envelope info
      var loginAccount = new docusign.LoginAccount();
      loginAccount = loginAccounts[0];
      var accountId = loginAccount.accountId;

      // instantiate a new EnvelopesApi object
      var envelopesApi = new docusign.EnvelopesApi();

      // call the getEnvelope() API
      envelopesApi.getEnvelope(accountId, envelopeId, null, function (error, env, response) {
        if (error) {
          console.log('Error: ' + error);
          return;
        }

        if (env) {
          console.log('Envelope: ' + JSON.stringify(env));
        }
      });
    }
  });
}; // end GetEnvelopeInformation()

/* ****************************************************************************************************************
* listRecipients()
*
* This recipe demonstrates how to retrieve real-time envelope recipient information for an existing envelope.
* The call will return information on all recipients that are part of the envelope's routing order.
******************************************************************************************************************/
var listRecipients = function () {
  // TODO: Enter envelopeId of an envelope you have access to (i.e. you sent the envelope or you're an account admin)
  var envelopeId = '[ENVELOPE_ID]';

  // initialize the api client
  var apiClient = new docusign.ApiClient();
  apiClient.setBasePath(BaseUrl);

  // create JSON formatted auth header
  var creds = '{"Username":"' + UserName + '","Password":"' + Password + '","IntegratorKey":"' + IntegratorKey + '"}';
  apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);

  // assign api client to the Configuration object
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  // ===============================================================================
  // Step 1:  Login() API
  // ===============================================================================
  // login call available off the AuthenticationApi
  var authApi = new docusign.AuthenticationApi();

  // login has some optional parameters we can set
  var loginOps = new authApi.LoginOptions();
  loginOps.setApiPassword('true');
  loginOps.setIncludeAccountIdGuid('true');
  authApi.login(loginOps, function (error, loginInfo, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }

    if (loginInfo) {
      // list of user account(s)
      // note that a given user may be a member of multiple accounts
      var loginAccounts = loginInfo.getLoginAccounts();
      console.log('LoginInformation: ' + JSON.stringify(loginAccounts));

      // ===============================================================================
      // Step 2:  List Recipients() API
      // ===============================================================================

      // use the |accountId| we retrieved through the Login API
      var loginAccount = new docusign.LoginAccount();
      loginAccount = loginAccounts[0];
      var accountId = loginAccount.accountId;

      // instantiate a new EnvelopesApi object
      var envelopesApi = new docusign.EnvelopesApi();

      // call the listRecipients() API
      envelopesApi.listRecipients(accountId, envelopeId, function (error, recips, response) {
        if (error) {
          console.log('Error: ' + error);
          return;
        }

        if (recips) {
          console.log('Recipients: ' + JSON.stringify(recips));
        }
      });
    }
  });
}; // end listRecipients()

/* ****************************************************************************************************************
* ListEnvelopes()
*
* This recipe demonstrates how to retrieve real-time envelope status and information for an existing envelopes in
* your account.  The returned set of envelopes can be filtered by date, status, or other properties.
******************************************************************************************************************/
var ListEnvelopes = function () {
  // initialize the api client
  var apiClient = new docusign.ApiClient();
  apiClient.setBasePath(BaseUrl);

  // create JSON formatted auth header
  var creds = '{"Username":"' + UserName + '","Password":"' + Password + '","IntegratorKey":"' + IntegratorKey + '"}';
  apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);

  // assign api client to the Configuration object
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  // ===============================================================================
  // Step 1:  Login() API
  // ===============================================================================
  // login call available off the AuthenticationApi
  var authApi = new docusign.AuthenticationApi();

  // login has some optional parameters we can set
  var loginOps = new authApi.LoginOptions();
  loginOps.setApiPassword('true');
  loginOps.setIncludeAccountIdGuid('true');
  authApi.login(loginOps, function (error, loginInfo, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }

    if (loginInfo) {
      // list of user account(s)
      // note that a given user may be a member of multiple accounts
      var loginAccounts = loginInfo.getLoginAccounts();
      console.log('LoginInformation: ' + JSON.stringify(loginAccounts));

      // ===============================================================================
      // Step 2:  List Envelope API
      // ===============================================================================

      // use the |accountId| we retrieved through the Login API
      var loginAccount = new docusign.LoginAccount();
      loginAccount = loginAccounts[0];
      var accountId = loginAccount.accountId;

      // instantiate a new EnvelopesApi object
      var envelopesApi = new docusign.EnvelopesApi();

      // the list status changes call requires at least a from_date
      var options = new envelopesApi.ListStatusChangesOptions();

      // set from date to filter envelopes (ex: Dec 1, 2015)
      options.setFromDate('2015/12/01');

      // call the listStatusChanges() API
      envelopesApi.listStatusChanges(accountId, options, function (error, envelopes, response) {
        if (error) {
          console.log('Error: ' + error);
          return;
        }

        if (envelopes) {
          console.log('EnvelopesInformation: ' + JSON.stringify(envelopes));
        }
      });
    }
  });
}; // end ListEnvelopes()

/* ****************************************************************************************************************
* GetEnvelopeDocuments()
*
* This recipe demonstrates how to retrieve the documents from a given envelope.  Note that if the envelope is in
* completed status that you have the option of downloading just the signed documents or a combined PDF that contains
* the envelope documents as well as the envelope's auto-generated Certificate of Completion (CoC).
******************************************************************************************************************/
var GetEnvelopeDocuments = function () {
  // TODO: Enter envelopeId of an envelope you have access to (i.e. you sent the envelope or
  // you're an account admin in same account).  Also provide a valid documentId
  var envelopeId = '[ENVELOPE_ID]';
  var documentId = '[DOCUMENT_ID]';

  // initialize the api client
  var apiClient = new docusign.ApiClient();
  apiClient.setBasePath(BaseUrl);

  // create JSON formatted auth header
  var creds = '{"Username":"' + UserName + '","Password":"' + Password + '","IntegratorKey":"' + IntegratorKey + '"}';
  apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);

  // assign api client to the Configuration object
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  // ===============================================================================
  // Step 1:  Login() API
  // ===============================================================================
  // login call available off the AuthenticationApi
  var authApi = new docusign.AuthenticationApi();

  // login has some optional parameters we can set
  var loginOps = new authApi.LoginOptions();
  loginOps.setApiPassword('true');
  loginOps.setIncludeAccountIdGuid('true');
  authApi.login(loginOps, function (error, loginInfo, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }

    if (loginInfo) {
      // list of user account(s)
      // note that a given user may be a member of multiple accounts
      var loginAccounts = loginInfo.getLoginAccounts();
      console.log('LoginInformation: ' + JSON.stringify(loginAccounts));

      // ===============================================================================
      // Step 2:  Get Document API
      // ===============================================================================

      // use the |accountId| we retrieved through the Login API
      var loginAccount = new docusign.LoginAccount();
      loginAccount = loginAccounts[0];
      var accountId = loginAccount.accountId;

      // instantiate a new EnvelopesApi object
      var envelopesApi = new docusign.EnvelopesApi();

      // call the getDocument() API
      envelopesApi.getDocument(accountId, envelopeId, documentId, function (error, document, response) {
        if (error) {
          console.log('Error: ' + error);
          return;
        }

        if (document) {
          try {
            var fs = require('fs');
            var path = require('path');
            // download the document pdf
            var filename = accountId + '_' + envelopeId + '_' + documentId + '.pdf';
            var tempFile = path.resolve(__dirname, filename);
            fs.writeFile(tempFile, Buffer.from(document, 'binary'), function (err) {
              if (err) console.log('Error: ' + err);
            });
            console.log('Document ' + documentId + ' from envelope ' + envelopeId + ' has been downloaded to ' + tempFile);
          } catch (ex) {
            console.log('Exception: ' + ex);
          }
        }
      });
    }
  });
}; // end GetEnvelopeDocuments()

/* ****************************************************************************************************************
* EmbeddedSending()
*
* This recipe demonstrates how to open the Embedded Sending view of a given envelope (AKA the Sender View).  While
* in the sender view the user can edit the envelope by adding/deleting documents, tabs, and/or recipients before
* sending the envelope (signature request) out.
******************************************************************************************************************/
var EmbeddedSending = function () {
  // TODO: Enter signer info and path to a test file
  var signerName = '[SIGNER_NAME]';
  var signerEmail = '[SIGNER_EMAIL]';

  // point to a local document for testing
  var SignTest1File = '[PATH/TO/DOCUMENT/TEST.PDF]';

  // we will generate this from the second API call we make
  var envelopeId = '';

  // initialize the api client
  var apiClient = new docusign.ApiClient();
  apiClient.setBasePath(BaseUrl);

  // create JSON formatted auth header
  var creds = '{"Username":"' + UserName + '","Password":"' + Password + '","IntegratorKey":"' + IntegratorKey + '"}';
  apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);

  // assign api client to the Configuration object
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  // ===============================================================================
  // Step 1:  Login() API
  // ===============================================================================
  // login call available off the AuthenticationApi
  var authApi = new docusign.AuthenticationApi();

  // login has some optional parameters we can set
  var loginOps = new authApi.LoginOptions();
  loginOps.setApiPassword('true');
  loginOps.setIncludeAccountIdGuid('true');
  authApi.login(loginOps, function (error, loginInfo, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }

    if (loginInfo) {
      // list of user account(s)
      // note that a given user may be a member of multiple accounts
      var loginAccounts = loginInfo.getLoginAccounts();
      console.log('LoginInformation: ' + JSON.stringify(loginAccounts));

      // ===============================================================================
      // Step 2:  Create Envelope API (AKA Signature Request)
      // ===============================================================================

      // create a byte array that will hold our document bytes
      var fileBytes = null;
      try {
        var fs = require('fs');
        var path = require('path');
        // read file from a local directory
        fileBytes = fs.readFileSync(path.resolve(__dirname, SignTest1File));
      } catch (ex) {
        console.log('Exception: ' + ex);
      }

      // create an envelope that will store the document(s), field(s), and recipient(s)
      var envDef = new docusign.EnvelopeDefinition();
      envDef.setEmailSubject('Please sign this document sent from Node SDK)');

      // add a document to the envelope
      var doc = new docusign.Document();
      var base64Doc = Buffer.from(fileBytes).toString('base64');
      doc.setDocumentBase64(base64Doc);
      doc.setName('TestFile.pdf'); // can be different from actual file name
      doc.setDocumentId('1');

      var docs = [];
      docs.push(doc);
      envDef.setDocuments(docs);

      // add a recipient to sign the document, identified by name and email we used above
      var signer = new docusign.Signer();
      signer.setEmail(signerEmail);
      signer.setName(signerName);
      signer.setRecipientId('1');

      // create a signHere tab somewhere on the document for the signer to sign
      // default unit of measurement is pixels, can be mms, cms, inches also
      var signHere = new docusign.SignHere();
      signHere.setDocumentId('1');
      signHere.setPageNumber('1');
      signHere.setRecipientId('1');
      signHere.setXPosition('100');
      signHere.setYPosition('100');

      // can have multiple tabs, so need to add to envelope as a single element list
      var signHereTabs = [];
      signHereTabs.push(signHere);
      var tabs = new docusign.Tabs();
      tabs.setSignHereTabs(signHereTabs);
      signer.setTabs(tabs);

      // add recipients (in this case a single signer) to the envelope
      envDef.setRecipients(new docusign.Recipients());
      envDef.getRecipients().setSigners([]);
      envDef.getRecipients().getSigners().push(signer);

      // set envelope's |status| to "created" so we can open the embedded sending view next
      envDef.setStatus('created');

      // use the |accountId| we retrieved through the Login API to create the Envelope
      var loginAccount = new docusign.LoginAccount();
      loginAccount = loginAccounts[0];
      var accountId = loginAccount.accountId;

      // instantiate a new EnvelopesApi object
      var envelopesApi = new docusign.EnvelopesApi();

      // call the createEnvelope() API
      envelopesApi.createEnvelope(accountId, envDef, function (error, envelopeSummary, response) {
        if (error) {
          console.log('Error: ' + error);
          return;
        }

        if (envelopeSummary) {
          envelopeId = envelopeSummary.getEnvelopeId();
          console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));

          // ===============================================================================
          // Step 3:  Create SenderView API
          // ===============================================================================
          // use the |accountId| we retrieved through the Login API
          var loginAccount = new docusign.LoginAccount();
          loginAccount = loginAccounts[0];
          var accountId = loginAccount.accountId;

          // instantiate a new EnvelopesApi object
          var envelopesApi = new docusign.EnvelopesApi();

          // set the url where you want the sender to go once they are done editing/sending the envelope
          var returnUrl = new docusign.ReturnUrlRequest();
          returnUrl.setReturnUrl('https://www.docusign.com/devcenter');

          // call the createEnvelope() API
          envelopesApi.createSenderView(accountId, envelopeId, returnUrl, function (error, senderView, response) {
            if (error) {
              console.log('Error: ' + error);
              return;
            }

            if (senderView) {
              console.log('ViewUrl: ' + JSON.stringify(senderView));
            }
          });
        }
      });
    }
  });
}; // end EmbeddedSending()

/* ****************************************************************************************************************
* EmbeddedSigning()
*
* This recipe demonstrates how to open the Embedded Signing view of a given envelope (AKA the Recipient View).  The
* Recipient View can be used to sign document(s) directly through your UI without having to context-switch and sign
* through the DocuSign Website.  This is done by opening the Recipient View in an iFrame for web applications or
* a webview for mobile apps.
******************************************************************************************************************/
var EmbeddedSigning = function () {
  // TODO: Enter signer info and path to a test file
  var signerName = '[SIGNER_NAME]';
  var signerEmail = '[SIGNER_EMAIL]';

  // point to a local document for testing
  var SignTest1File = '[PATH/TO/DOCUMENT/TEST.PDF]';

  // we will generate this from the second API call we make
  var envelopeId = '';

  // initialize the api client
  var apiClient = new docusign.ApiClient();
  apiClient.setBasePath(BaseUrl);

  // create JSON formatted auth header
  var creds = '{"Username":"' + UserName + '","Password":"' + Password + '","IntegratorKey":"' + IntegratorKey + '"}';
  apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);

  // assign api client to the Configuration object
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  // ===============================================================================
  // Step 1:  Login() API
  // ===============================================================================
  // login call available off the AuthenticationApi
  var authApi = new docusign.AuthenticationApi();

  // login has some optional parameters we can set
  var loginOps = new authApi.LoginOptions();
  loginOps.setApiPassword('true');
  loginOps.setIncludeAccountIdGuid('true');
  authApi.login(loginOps, function (error, loginInfo, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }

    if (loginInfo) {
      // list of user account(s)
      // note that a given user may be a member of multiple accounts
      var loginAccounts = loginInfo.getLoginAccounts();
      console.log('LoginInformation: ' + JSON.stringify(loginAccounts));

      // ===============================================================================
      // Step 2:  Create Envelope API (AKA Signature Request)
      // ===============================================================================

      // create a byte array that will hold our document bytes
      var fileBytes = null;
      try {
        var fs = require('fs');
        var path = require('path');
        // read file from a local directory
        fileBytes = fs.readFileSync(path.resolve(__dirname, SignTest1File));
      } catch (ex) {
        // TODO: handle error
        console.log('Exception: ' + ex);
      }

      // create an envelope that will store the document(s), field(s), and recipient(s)
      var envDef = new docusign.EnvelopeDefinition();
      envDef.setEmailSubject('Please sign this document sent from Node SDK)');

      // add a document to the envelope
      var doc = new docusign.Document();
      var base64Doc = Buffer.from(fileBytes).toString('base64');
      doc.setDocumentBase64(base64Doc);
      doc.setName('TestFile.pdf'); // can be different from actual file name
      doc.setDocumentId('1');

      var docs = [];
      docs.push(doc);
      envDef.setDocuments(docs);

      // add a recipient to sign the document, identified by name and email we used above
      var signer = new docusign.Signer();
      signer.setEmail(signerEmail);
      signer.setName(signerName);
      signer.setRecipientId('1');

      // Must set |clientUserId| for embedded recipients and provide the same value when requesting
      // the recipient view URL in the next step
      signer.setClientUserId('1001');

      // create a signHere tab somewhere on the document for the signer to sign
      // default unit of measurement is pixels, can be mms, cms, inches also
      var signHere = new docusign.SignHere();
      signHere.setDocumentId('1');
      signHere.setPageNumber('1');
      signHere.setRecipientId('1');
      signHere.setXPosition('100');
      signHere.setYPosition('100');

      // can have multiple tabs, so need to add to envelope as a single element list
      var signHereTabs = [];
      signHereTabs.push(signHere);
      var tabs = new docusign.Tabs();
      tabs.setSignHereTabs(signHereTabs);
      signer.setTabs(tabs);

      // add recipients (in this case a single signer) to the envelope
      envDef.setRecipients(new docusign.Recipients());
      envDef.getRecipients().setSigners([]);
      envDef.getRecipients().getSigners().push(signer);

      // send the envelope by setting |status| to "sent". To save as a draft set to "created"
      envDef.setStatus('sent');

      // use the |accountId| we retrieved through the Login API to create the Envelope
      var loginAccount = new docusign.LoginAccount();
      loginAccount = loginAccounts[0];
      var accountId = loginAccount.accountId;

      // instantiate a new EnvelopesApi object
      var envelopesApi = new docusign.EnvelopesApi();

      // call the createEnvelope() API
      envelopesApi.createEnvelope(accountId, envDef, null, function (error, envelopeSummary, response) {
        if (error) {
          console.log('Error: ' + error);
          return;
        }

        if (envelopeSummary) {
          envelopeId = envelopeSummary.envelopeId;
          console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));

          // ===============================================================================
          // Step 3:  Create RecipientView API
          // ===============================================================================
          // use the |accountId| we retrieved through the Login API
          var loginAccount = new docusign.LoginAccount();
          loginAccount = loginAccounts[0];
          var accountId = loginAccount.accountId;

          // instantiate a new EnvelopesApi object
          var envelopesApi = new docusign.EnvelopesApi();

          // set the url where you want the recipient to go once they are done signing
          var returnUrl = new docusign.RecipientViewRequest();
          returnUrl.setReturnUrl('https://www.docusign.com/devcenter');
          returnUrl.setAuthenticationMethod('email');

          // recipient information must match embedded recipient info we provided in step #2
          returnUrl.setEmail(signerEmail);
          returnUrl.setUserName(signerName);
          returnUrl.setRecipientId('1');
          returnUrl.setClientUserId('1001');

          // call the CreateRecipientView API
          envelopesApi.createRecipientView(accountId, envelopeId, returnUrl, function (error, recipientView, response) {
            if (error) {
              console.log('Error: ' + error);
              return;
            }

            if (recipientView) {
              console.log('ViewUrl: ' + JSON.stringify(recipientView));
            }
          });
        }
      });
    }
  });
}; // end EmbeddedSigning()

/* ****************************************************************************************************************
* EmbeddedConsole()
*
* This recipe demonstrates how to open the DocuSign Console in an embedded view.  DocuSign recommends you use an
* iFrame for web applications and a webview for mobile apps.
******************************************************************************************************************/
var EmbeddedConsole = function () {
  // initialize the api client
  var apiClient = new docusign.ApiClient();
  apiClient.setBasePath(BaseUrl);

  // create JSON formatted auth header
  var creds = '{"Username":"' + UserName + '","Password":"' + Password + '","IntegratorKey":"' + IntegratorKey + '"}';
  apiClient.addDefaultHeader('X-DocuSign-Authentication', creds);

  // assign api client to the Configuration object
  docusign.Configuration.default.setDefaultApiClient(apiClient);

  // ===============================================================================
  // Step 1:  Login() API
  // ===============================================================================
  // login call available off the AuthenticationApi
  var authApi = new docusign.AuthenticationApi();

  // login has some optional parameters we can set
  var loginOps = new authApi.LoginOptions();
  loginOps.setApiPassword('true');
  loginOps.setIncludeAccountIdGuid('true');
  authApi.login(loginOps, function (error, loginInfo, response) {
    if (error) {
      console.log('Error: ' + error);
      return;
    }

    if (loginInfo) {
      // list of user account(s)
      // note that a given user may be a member of multiple accounts
      var loginAccounts = loginInfo.getLoginAccounts();
      console.log('LoginInformation: ' + JSON.stringify(loginAccounts));

      // ===============================================================================
      // Step 2:  Create ConsoleView API
      // ===============================================================================

      // use the |accountId| we retrieved through the Login API
      var loginAccount = new docusign.LoginAccount();
      loginAccount = loginAccounts[0];
      var accountId = loginAccount.accountId;

      // instantiate a new envelopesApi object
      var envelopesApi = new docusign.EnvelopesApi();

      // set the url where you want the user to go once they logout of the Console
      var returnUrl = new docusign.ConsoleViewRequest();
      returnUrl.setReturnUrl('https://www.docusign.com/devcenter');

      // call the createConsoleView() API
      envelopesApi.createConsoleView(accountId, returnUrl, function (error, consoleView, response) {
        if (error) {
          console.log('Error: ' + error);
          return;
        }

        if (consoleView) {
          console.log('ConsoleView: ' + JSON.stringify(consoleView));
        }
      });
    }
  });
}; // end EmbeddedConsole()




var assert = require('assert');
var docusign = require('../src/index');
var config = require('../test-config.json');
var path = require('path');

var UserName = config.email;
var IntegratorKey = config.integratorKey;
var TemplateId = config.templateId;

// for production environment update to "www.docusign.net/restapi"
var BaseUrl = 'https://demo.docusign.net/restapi';
var SignTest1File = 'docs/SignTest1.pdf';
var accountId = '';
var envelopeId = '';
var UserId = config.userId;
var OAuthBaseUrl = 'account-d.docusign.com';
var RedirectURI = 'https://www.docusign.com/api';
var privateKeyFilename = 'keys/docusign_private_key.txt';

describe('SDK Unit Tests:', function (done) {
  var apiClient = new docusign.ApiClient();
  before(function (done) {
    apiClient.setBasePath(BaseUrl);
    // IMPORTANT NOTE:
    // the first time you ask for a JWT access token, you should grant access by making the following call
    // get DocuSign OAuth authorization url:
    var oauthLoginUrl = apiClient.getJWTUri(IntegratorKey, RedirectURI, OAuthBaseUrl);
    // open DocuSign OAuth authorization url in the browser, login and grant access
    console.log(oauthLoginUrl);
    // END OF NOTE

    // configure the ApiClient to asynchronously get an access to token and store it
    apiClient.configureJWTAuthorizationFlow(path.resolve(__dirname, privateKeyFilename), OAuthBaseUrl, IntegratorKey, UserId, 3600, done);
  });

  it('login', function (done) {
    var authApi = new docusign.AuthenticationApi(apiClient);
    var loginOps = {};
    loginOps.apiPassword = 'true';
    loginOps.includeAccountIdGuid = 'true';
    authApi.login(loginOps, function (error, loginInfo, response) {
      if (error) {
        return done(error);
      }

      if (loginInfo) {
        // list of user account(s)
        // note that a given user may be a member of multiple accounts
        var loginAccounts = loginInfo.loginAccounts;
        console.log('LoginInformation: ' + JSON.stringify(loginAccounts));
        var loginAccount = loginAccounts[0];
        accountId = loginAccount.accountId;
        var baseUrl = loginAccount.baseUrl;
        var accountDomain = baseUrl.split('/v2');

        // below code required for production, no effect in demo (same domain)
        apiClient.setBasePath(accountDomain[0]);
        docusign.Configuration.default.setDefaultApiClient(apiClient);

        console.log('LoginInformation: ' + JSON.stringify(loginAccounts));
        done();
      }
    });
  });

  it('requestASignature', function (done) {
    var fileBytes = null;
    try {
      var fs = require('fs');
      // read file from a local directory
      fileBytes = fs.readFileSync(path.resolve(__dirname, SignTest1File));
    } catch (ex) {
      // handle error
      console.log('Exception: ' + ex);
    }

    // create an envelope to be signed
    var envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = 'Please Sign my Node SDK Envelope';
    envDef.emailBlurb = 'Hello, Please sign my Node SDK Envelope.';

    // add a document to the envelope
    var doc = new docusign.Document();
    var base64Doc = Buffer.from(fileBytes).toString('base64');
    doc.documentBase64 = base64Doc;
    doc.name = 'TestFile.pdf';
    doc.documentId = '1';

    var docs = [];
    docs.push(doc);
    envDef.documents = docs;

    // Add a recipient to sign the document
    var signer = new docusign.Signer();
    signer.email = UserName;
    signer.name = 'Pat Developer';
    signer.recipientId = '1';

    // create a signHere tab somewhere on the document for the signer to sign
    // default unit of measurement is pixels, can be mms, cms, inches also
    var signHere = new docusign.SignHere();
    signHere.documentId = '1';
    signHere.pageNumber = '1';
    signHere.recipientId = '1';
    signHere.xPosition = '100';
    signHere.yPosition = '100';

    // can have multiple tabs, so need to add to envelope as a single element list
    var signHereTabs = [];
    signHereTabs.push(signHere);
    var tabs = new docusign.Tabs();
    tabs.signHereTabs = signHereTabs;
    signer.tabs = tabs;

    // Above causes issue
    envDef.recipients = new docusign.Recipients();
    envDef.recipients.signers = [];
    envDef.recipients.signers.push(signer);

    // send the envelope (otherwise it will be "created" in the Draft folder
    envDef.status = 'sent';

    var envelopesApi = new docusign.EnvelopesApi(apiClient);

    envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, function (error, envelopeSummary, response) {
      if (error) {
        return done(error);
      }

      if (envelopeSummary) {
        console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
        envelopeId = envelopeSummary.envelopeId;
        done();
      }
    });
  });

  it('requestSignatureFromTemplate', function (done) {
    var templateRoleName = 'Needs to sign';

    // create an envelope to be signed
    var envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = 'Please Sign my Node SDK Envelope';
    envDef.emailBlurb = 'Hello, Please sign my Node SDK Envelope.';

    // / assign template information including ID and role(s)
    envDef.templateId = TemplateId;

    // create a template role with a valid templateId and roleName and assign signer info
    var tRole = new docusign.TemplateRole();
    tRole.roleName = templateRoleName;
    tRole.name = 'Pat Developer';
    tRole.email = UserName;

    // create a list of template roles and add our newly created role
    var templateRolesList = [];
    templateRolesList.push(tRole);

    // assign template role(s) to the envelope
    envDef.templateRoles = templateRolesList;

    // send the envelope by setting |status| to "sent". To save as a draft set to "created"
    envDef.status = 'sent';

    var envelopesApi = new docusign.EnvelopesApi(apiClient);

    envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, function (error, envelopeSummary, response) {
      if (error) {
        return done(error);
      }

      if (envelopeSummary) {
        console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
        done();
      }
    });
  });

  it('embeddedSigning', function (done) {
    var fileBytes = null;
    try {
      var fs = require('fs');
      // read file from a local directory
      fileBytes = fs.readFileSync(path.resolve(__dirname, SignTest1File));
    } catch (ex) {
      // handle error
      console.log('Exception: ' + ex);
    }

    // create an envelope to be signed
    var envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = 'Please Sign my Node SDK Envelope';
    envDef.emailBlurb = 'Hello, Please sign my Node SDK Envelope.';

    // add a document to the envelope
    var doc = new docusign.Document();
    var base64Doc = Buffer.from(fileBytes).toString('base64');
    doc.documentBase64 = base64Doc;
    doc.name = 'TestFile.pdf';
    doc.documentId = '1';

    var docs = [];
    docs.push(doc);
    envDef.documents = docs;

    // Add a recipient to sign the document
    var signer = new docusign.Signer();
    signer.email = UserName;
    var name = 'Pat Developer';
    signer.name = name;
    signer.recipientId = '1';

    // this value represents the client's unique identifier for the signer
    var clientUserId = '2939';
    signer.clientUserId = clientUserId;

    // create a signHere tab somewhere on the document for the signer to sign
    // default unit of measurement is pixels, can be mms, cms, inches also
    var signHere = new docusign.SignHere();
    signHere.documentId = '1';
    signHere.pageNumber = '1';
    signHere.recipientId = '1';
    signHere.xPosition = '100';
    signHere.yPosition = '100';

    // can have multiple tabs, so need to add to envelope as a single element list
    var signHereTabs = [];
    signHereTabs.push(signHere);
    var tabs = new docusign.Tabs();
    tabs.signHereTabs = signHereTabs;
    signer.tabs = tabs;

    // Above causes issue
    envDef.recipients = new docusign.Recipients();
    envDef.recipients.signers = [];
    envDef.recipients.signers.push(signer);

    // send the envelope (otherwise it will be "created" in the Draft folder
    envDef.status = 'sent';

    var envelopesApi = new docusign.EnvelopesApi(apiClient);

    envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, function (error, envelopeSummary, response) {
      if (error) {
        return done(error);
      }

      if (envelopeSummary) {
        console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
        var returnUrl = 'http://www.docusign.com/developer-center';
        var recipientView = new docusign.RecipientViewRequest();
        recipientView.returnUrl = returnUrl;
        recipientView.clientUserId = clientUserId;
        recipientView.authenticationMethod = 'email';
        recipientView.userName = name;
        recipientView.email = UserName;
        envelopesApi.createRecipientView(accountId, envelopeSummary.envelopeId, {'recipientViewRequest': recipientView}, function (error, viewUrl, response) {
          if (error) {
            return done(error);
          }

          if (viewUrl) {
            console.log('ViewUrl is ' + JSON.stringify(viewUrl));
            done();
          }
        });
      }
    });
  });

  it('createTemplate', function (done) {
    var fileBytes = null;
    try {
      var fs = require('fs');
      // read file from a local directory
      fileBytes = fs.readFileSync(path.resolve(__dirname, SignTest1File));
    } catch (ex) {
      // handle error
      console.log('Exception: ' + ex);
    }

    // create an envelope to be signed
    var templateDef = new docusign.EnvelopeTemplate();
    templateDef.emailSubject = 'Please Sign my Node SDK Envelope';
    templateDef.emailBlurb = 'Hello, Please sign my Node SDK Envelope.';

    // add a document to the envelope
    var doc = new docusign.Document();
    var base64Doc = Buffer.from(fileBytes).toString('base64');
    doc.documentBase64 = base64Doc;
    doc.name = 'TestFile.pdf';
    doc.documentId = '1';

    var docs = [];
    docs.push(doc);
    templateDef.documents = docs;

    // Add a recipient to sign the document
    var signer = new docusign.Signer();
    signer.roleName = 'Signer1';
    signer.recipientId = '1';

    // Create a SignHere tab somewhere on the document for the signer to sign
    var signHere = new docusign.SignHere();
    signHere.documentId = '1';
    signHere.pageNumber = '1';
    signHere.recipientId = '1';
    signHere.xPosition = '100';
    signHere.yPosition = '100';

    // can have multiple tabs, so need to add to envelope as a single element list
    var signHereTabs = [];
    signHereTabs.push(signHere);
    var tabs = new docusign.Tabs();
    tabs.signHereTabs = signHereTabs;
    signer.tabs = tabs;

    // Above causes issue
    templateDef.recipients = new docusign.Recipients();
    templateDef.recipients.signers = [];
    templateDef.recipients.signers.push(signer);

    var envTemplateDef = new docusign.EnvelopeTemplateDefinition();
    envTemplateDef.name = 'myTemplate';
    templateDef.envelopeTemplateDefinition = envTemplateDef;

    var templatesApi = new docusign.TemplatesApi(apiClient);

    templatesApi.createTemplate(accountId, {'envelopeTemplate': templateDef}, function (error, templateSummary, response) {
      if (error) {
        return done(error);
      }

      if (templateSummary) {
        console.log('TemplateSummary: ' + JSON.stringify(templateSummary));
        done();
      }
    });
  });

  it('downLoadEnvelopeDocuments', function (done) {
    var fileBytes = null;
    try {
      var fs = require('fs');
      // read file from a local directory
      fileBytes = fs.readFileSync(path.resolve(__dirname, SignTest1File));
    } catch (ex) {
      // handle error
      console.log('Exception: ' + ex);
    }

    // create an envelope to be signed
    var envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = 'Please Sign my Node SDK Envelope';
    envDef.emailBlurb = 'Hello, Please sign my Node SDK Envelope.';

    // add a document to the envelope
    var doc = new docusign.Document();
    var base64Doc = Buffer.from(fileBytes).toString('base64');
    doc.documentBase64 = base64Doc;
    doc.name = 'TestFile.pdf';
    doc.documentId = '1';

    var docs = [];
    docs.push(doc);
    envDef.documents = docs;

    // Add a recipient to sign the document
    var signer = new docusign.Signer();
    signer.email = UserName;
    var name = 'Pat Developer';
    signer.name = name;
    signer.recipientId = '1';

    // this value represents the client's unique identifier for the signer
    var clientUserId = '2939';
    signer.clientUserId = clientUserId;

    // create a signHere tab somewhere on the document for the signer to sign
    // default unit of measurement is pixels, can be mms, cms, inches also
    var signHere = new docusign.SignHere();
    signHere.documentId = '1';
    signHere.pageNumber = '1';
    signHere.recipientId = '1';
    signHere.xPosition = '100';
    signHere.yPosition = '100';

    // can have multiple tabs, so need to add to envelope as a single element list
    var signHereTabs = [];
    signHereTabs.push(signHere);
    var tabs = new docusign.Tabs();
    tabs.signHereTabs = signHereTabs;
    signer.tabs = tabs;

    // Above causes issue
    envDef.recipients = new docusign.Recipients();
    envDef.recipients.signers = [];
    envDef.recipients.signers.push(signer);

    // send the envelope (otherwise it will be "created" in the Draft folder
    envDef.status = 'sent';

    var envelopesApi = new docusign.EnvelopesApi(apiClient);

    envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, function (error, envelopeSummary, response) {
      if (error) {
        return done(error);
      }

      if (envelopeSummary) {
        console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
        envelopesApi.getDocument(accountId, envelopeSummary.envelopeId, 'combined', null, function (err, pdfBytes, response) {
          if (err) {
            return done(err);
          }

          if (pdfBytes) {
            try {
              var fs = require('fs');
              // download the document pdf
              var filename = accountId + '_' + envelopeSummary.envelopeId + '_combined.pdf';
              var tempFile = path.resolve(__dirname, filename);
              fs.writeFile(tempFile, Buffer.from(pdfBytes, 'binary'), function (err) {
                if (err) console.log('Error: ' + err);
              });
              console.log('Document from envelope ' + envelopeSummary.envelopeId + ' has been downloaded to ' + tempFile);
              done();
            } catch (ex) {
              console.log('Exception: ' + ex);
            }
          }
        });
      }
    });
  });

  it('listDocuments', function (done) {
    var envelopesApi = new docusign.EnvelopesApi(apiClient);

    envelopesApi.listDocuments(accountId, envelopeId, null, function (error, docsList, response) {
      if (error) {
        return done(error);
      }

      if (docsList) {
        assert.equal(envelopeId, docsList.envelopeId);
        console.log('EnvelopeDocumentsResult: ' + JSON.stringify(docsList));
        done();
      }
    });
  });

  it('getDiagnosticLogs', function (done) {
    var fileBytes = null;
    try {
      var fs = require('fs');
      // read file from a local directory
      fileBytes = fs.readFileSync(path.resolve(__dirname, SignTest1File));
    } catch (ex) {
      // handle error
      console.log('Exception: ' + ex);
    }

    // create an envelope to be signed
    var envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = 'downLoadEnvelopeDocuments';
    envDef.emailBlurb = 'Hello, Please sign my Node SDK Envelope.';

    // add a document to the envelope
    var doc = new docusign.Document();
    var base64Doc = Buffer.from(fileBytes).toString('base64');
    doc.documentBase64 = base64Doc;
    doc.name = 'TestFile.pdf';
    doc.documentId = '1';

    var docs = [];
    docs.push(doc);
    envDef.documents = docs;

    // Add a recipient to sign the document
    var signer = new docusign.Signer();
    signer.email = UserName;
    var name = 'Pat Developer';
    signer.name = name;
    signer.recipientId = '1';

    // this value represents the client's unique identifier for the signer
    var clientUserId = '2939';
    signer.clientUserId = clientUserId;

    // create a signHere tab somewhere on the document for the signer to sign
    // default unit of measurement is pixels, can be mms, cms, inches also
    var signHere = new docusign.SignHere();
    signHere.documentId = '1';
    signHere.pageNumber = '1';
    signHere.recipientId = '1';
    signHere.xPosition = '100';
    signHere.yPosition = '100';

    // can have multiple tabs, so need to add to envelope as a single element list
    var signHereTabs = [];
    signHereTabs.push(signHere);
    var tabs = new docusign.Tabs();
    tabs.signHereTabs = signHereTabs;
    signer.tabs = tabs;

    // Above causes issue
    envDef.recipients = new docusign.Recipients();
    envDef.recipients.signers = [];
    envDef.recipients.signers.push(signer);

    // send the envelope (otherwise it will be "created" in the Draft folder
    envDef.status = 'sent';

    var diagApi = new docusign.DiagnosticsApi(apiClient);

    var diagSettings = new docusign.DiagnosticsSettingsInformation();
    diagSettings.apiRequestLogging = 'true';
    diagApi.updateRequestLogSettings({'diagnosticsSettingsInformation': diagSettings}, function (error, diagnosticsSettingsInformation, response) {
      if (error) {
        return done(error);
      }

      if (diagnosticsSettingsInformation) {
        console.log('DiagnosticsSettingsInformation: ' + JSON.stringify(diagnosticsSettingsInformation));

        var envelopesApi = new docusign.EnvelopesApi(apiClient);

        envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, function (error, envelopeSummary, response) {
          if (error) {
            return done(error);
          }

          if (envelopeSummary) {
            console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary));
            envelopesApi.getDocument(accountId, envelopeSummary.envelopeId, 'combined', null, function (error, pdfBytes, response) {
              if (error) {
                return done(error);
              }

              if (pdfBytes) {
                try {
                  var fs = require('fs');
                  // download the document pdf
                  var filename = accountId + '_' + envelopeSummary.envelopeId + '_combined.pdf';
                  var tempFile = path.resolve(__dirname, filename);
                  fs.writeFile(tempFile, Buffer.from(pdfBytes, 'binary'), function (err) {
                    if (err) console.log('Error: ' + err);
                  });
                  console.log('Document from envelope ' + envelopeSummary.envelopeId + ' has been downloaded to ' + tempFile);
                } catch (ex) {
                  console.log('Exception: ' + ex);
                }
                diagApi.listRequestLogs(null, function (error, logsList, response) {
                  if (error) {
                    return done(error);
                  }

                  if (logsList) {
                    var requestLogId = logsList.apiRequestLogs[0].requestLogId;
                    console.log(requestLogId);
                    diagApi.getRequestLog(requestLogId, function (error, diagBytes, response) {
                      if (error) {
                        return done(error);
                      }

                      if (diagBytes) {
                        try {
                          var fs = require('fs');
                          // download the document pdf
                          var filename = requestLogId + '.txt';
                          var tempFile = path.resolve(__dirname, filename);
                          fs.writeFile(tempFile, diagBytes, function (err) {
                            if (err) console.log('Error: ' + err);
                          });
                          console.log('Diagnostics ID ' + requestLogId + ' data has been downloaded to ' + tempFile);
                          done();
                        } catch (ex) {
                          console.log('Exception: ' + ex);
                        }
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });

  it('getTemplate', function (done) {
    var templatesApi = new docusign.TemplatesApi(apiClient);

    templatesApi.get(accountId, TemplateId, null, function (error, envelopeTemplate, response) {
      if (error) {
        return done(error);
      }

      if (envelopeTemplate) {
        console.log('EnvelopeTemplate: ' + JSON.stringify(envelopeTemplate));
        done();
      }
    });
  });
});



function sendTemplate (accountId, templateId, templateRoleName) {

  const tRole = new docusign.TemplateRole()

  tRole.roleName = templateRoleName
  tRole.email = 'philippe.leefsma@gmail.com' //recipientEmail
  tRole.name = 'Philippe Leefsma' // Recipient's Full Name

  // create a new envelope object that 
  // we will manage the signature request through
  const envDef = new docusign.EnvelopeDefinition()

  envDef.emailSubject = 'Please sign this document sent from Node SDK'
  envDef.templateId = templateId
  envDef.templateRoles = [tRole]

  // send the envelope by setting |status| to 'sent'
  // To save as a draft set to 'created'
  envDef.status = 'sent'

  const envelopesApi = new docusign.EnvelopesApi()

  envelopesApi.createEnvelope(
    accountId, 
    {'envelopeDefinition': envDef}, 
    (err, envelopeSummary, response) => {

      if (err) {
        console.error(err)
        return
      }

      console.log('EnvelopeSummary: ' + JSON.stringify(envelopeSummary))
  })
}