
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

function createPayPalClient() {
  const clientId = 'ARRUG8KATHcR4EzweZ7KQvmzDrcBUge5JXx_g71YpoQk_B0_zOs0L64sTJycnzvLNlBbO36v9ex-eRMY' ;
  const clientSecret = 'EDHB0s2ciJnK0owo0rMn1EiCqLIA44KBBS7uRoXpG82ZtAeyWrdBREd32hs0ghArgLxcZ-C7j1O4xrCO';

  // إنشاء البيئة (Sandbox أو Production)
  const environment = new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);

  // إنشاء العميل باستخدام البيئة
  const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

  return client;
}

module.exports = createPayPalClient;