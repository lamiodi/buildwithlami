// Preloaded only by the isolated test runner. Production never imports this file.
import nodemailer from 'nodemailer';

if (process.env.NODE_ENV !== 'test' || process.env.BWL_ISOLATED_TEST !== '1' ||
    !['localhost', '127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname)) {
    throw new Error('Test runtime requires an explicitly enabled local test database.');
}

nodemailer.createTransport = () => ({
    async sendMail(message) {
        if (message.to === 'otp-failure@isolated.test') throw new Error('Isolated SMTP failure');
        if (message.to === 'otp-timeout@isolated.test') return new Promise(() => {});
        return { messageId: 'isolated-test-message', accepted: ['test-recipient'] };
    },
    close() {},
});

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, options) => {
    const url = new URL(typeof input === 'string' ? input : input.url || input);
    if (url.hostname === 'api.paystack.co' && url.pathname === '/transaction/initialize') {
        const body = JSON.parse(options.body);
        return Response.json({ status: true, data: { reference: body.reference, authorization_url: `http://localhost/test-payment/${body.reference}` } });
    }
    if (['localhost', '127.0.0.1'].includes(url.hostname)) return realFetch(input, options);
    throw new Error('External network calls are disabled in isolated tests.');
};
