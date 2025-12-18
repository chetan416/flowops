import React from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Check } from 'lucide-react';
import { useRouter } from 'next/router';

const tiers = [
    {
        name: 'Hobby',
        price: 0,
        frequency: '/month',
        description: 'The essentials to provide your best work for clients.',
        features: ['5 products', 'Up to 1,000 subscribers', 'Basic analytics'],
        cta: 'Start for free',
        priceId: 'price_free',
    },
    {
        name: 'Freelancer',
        price: 15,
        frequency: '/month',
        description: 'A plan that scales with your rapidly growing business.',
        features: ['25 products', 'Up to 10,000 subscribers', 'Advanced analytics', '24-hour support response time'],
        cta: 'Buy Freelancer',
        priceId: 'price_1SeUtgGrAII971715nUWAsDB',
        mostPopular: true,
    },
    {
        name: 'Startup',
        price: 30,
        frequency: '/month',
        description: 'Dedicated support and infrastructure for your company.',
        features: ['Unlimited products', 'Unlimited subscribers', 'Advanced analytics', '1-hour, dedicated support response time'],
        cta: 'Buy Startup',
        priceId: 'price_1SeUwNGrAII97171hTtfYAsY',
    },
];

export default function Pricing() {
    const { user } = useAuth();
    const router = useRouter();

    const handleSubscribe = async (priceId: string) => {
        if (!user) {
            router.push('/auth/login?redirect=/pricing');
            return;
        }

        try {
            if (priceId === 'price_free') {
                // Update user plan to free locally
                await api.put('/users/me', { plan: 'free' });
                // Also Refresh Auth Conext User if possible, but redirecting works
                router.push('/dashboard?plan=free');
                return;
            }

            const response = await api.post('/subscriptions/create-checkout-session', null, {
                params: { price_id: priceId }
            });
            window.location.href = response.data.checkout_url;
        } catch (error) {
            console.error("Failed to create checkout session", error);
            alert("Failed to start subscription. Please try again.");
        }
    };

    return (
        <Layout>
            <div className="bg-gray-50 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            Pricing plans for teams of&nbsp;all&nbsp;sizes
                        </p>
                    </div>
                    <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
                        Choose an affordable plan that's packed with the best features for engaging your audience, creating customer loyalty, and driving sales.
                    </p>
                    <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {tiers.map((tier, tierIdx) => (
                            <div
                                key={tier.name}
                                className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10 ${tier.mostPopular ? 'ring-2 ring-indigo-600' : ''}`}
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-x-4">
                                        <h3
                                            id={tier.name}
                                            className={`text-lg font-semibold leading-8 ${tier.mostPopular ? 'text-indigo-600' : 'text-gray-900'}`}
                                        >
                                            {tier.name}
                                        </h3>
                                        {tier.mostPopular ? (
                                            <p className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600">
                                                Most popular
                                            </p>
                                        ) : null}
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
                                    <p className="mt-6 flex items-baseline gap-x-1">
                                        <span className="text-4xl font-bold tracking-tight text-gray-900">${tier.price}</span>
                                        <span className="text-sm font-semibold leading-6 text-gray-600">{tier.frequency}</span>
                                    </p>
                                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                                        {tier.features.map((feature) => (
                                            <li key={feature} className="flex gap-x-3">
                                                <Check className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    onClick={() => handleSubscribe(tier.priceId)}
                                    className={`mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${tier.mostPopular
                                        ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600'
                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                        }`}
                                >
                                    {tier.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
