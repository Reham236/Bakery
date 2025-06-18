

var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'ASit7SSjLs1NwJb_OFVkxOu41LO4h9myOuC9QzwsZAE9XpUF9Mu_4mtTlvxoMeObnkp0pkIoFgCqituI',
  'client_secret': 'EF0yERRnGcfSNXQSy7jaCBpno-eiStMPGMNPHDPJ1wSuSk8QlWs8IqT5VtgLfg_w75-yIxxxS9DgXqvO'
});
module.exports = paypal;