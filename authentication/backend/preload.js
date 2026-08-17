const originalFetch = globalThis.fetch;
globalThis.fetch = async function (url, options) {
  if (typeof url === 'string' && url.includes('api.resend.com/emails')) {
    try {
      const body = JSON.parse(options.body);
      console.log('--- INTERCEPTED RESEND EMAIL ---');
      console.log('To:', body.to);
      console.log('Body:', body.text || body.html);
      console.log('---------------------------------');
    } catch (e) {
      console.error('Failed to parse Resend body:', e);
    }
  }
  return originalFetch.apply(this, arguments);
};
