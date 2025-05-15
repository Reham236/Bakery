// config/paypalConfig.js
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', // يمكنك تغييرها إلى live عند الإطلاق
    'client_id': 'ARRUG8KATHcR4EzweZ7KQvmzDrcBUge5JXx_g71YpoQk_B0_zOs0L64sTJycnzvLNlBbO36v9ex-eRMY',
    'client_secret':'EDHB0s2ciJnK0owo0rMn1EiCqLIA44KBBS7uRoXpG82ZtAeyWrdBREd32hs0ghArgLxcZ-C7j1O4xrCO'
});


module.exports = paypal;