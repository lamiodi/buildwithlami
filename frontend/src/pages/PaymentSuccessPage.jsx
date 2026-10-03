import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

// Paystack's callback lands here after a successful hosted-checkout
// payment (see invoiceController: callback_url = FRONTEND_URL/track/payment-success).
// The reference is the invoice id — show it and the client's next step.
// The authoritative payment record is written server-side by the signed
// Paystack webhook, never by this page.
export default function PaymentSuccessPage() {
    const [params] = useSearchParams();
    const reference = params.get('reference') || params.get('trxref') || '';
    const [late, setLate] = useState(false);

    useEffect(() => {
        // If the webhook hasn't landed yet, reassure rather than alarm.
        const t = setTimeout(() => setLate(true), 8000);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background pt-24 pb-12 px-6 flex items-center justify-center">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-gray-700">
                <div className="w-14 h-14 mx-auto mb-4 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={28} />
                </div>
                <h1 className="text-2xl font-extrabold font-heading text-gray-900 dark:text-white mb-2">
                    Payment successful
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Thank you — your payment went through. Your invoice is marked
                    as paid and your receipt is on its way to your inbox.
                </p>
                {reference && (
                    <p className="text-xs text-gray-400 mb-6 font-mono break-all">
                        Reference: {reference}
                    </p>
                )}
                {late && (
                    <p className="text-xs text-gray-400 mb-6">
                        Don't see it reflected yet? Records can take a minute to
                        sync — we've been notified either way.
                    </p>
                )}
                <Link
                    to="/"
                    className="inline-block px-5 py-2.5 bg-accent hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors"
                >
                    Back to homepage
                </Link>
            </div>
        </div>
    );
}
