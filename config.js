
const APPID = process.env.APPID;
const PAGEID = process.env.PAGEID;//'208785169969673';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const g_credentials = JSON.parse(`{"web":{"client_id":"474433597852-3a4ofhu8sg8jk4qa9fdbd025ucpiba8b.apps.googleusercontent.com","project_id":"retail-page-demo-lucky-draw","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://www.googleapis.com/oauth2/v3/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"V08AHYnBKr0UYSWZWnXi0jhS"}}`);

module.exports = {
  APPID,
  PAGE_ACCESS_TOKEN,
  g_credentials,
};