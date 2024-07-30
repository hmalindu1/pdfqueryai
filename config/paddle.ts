export const PLANS = [
    {
        name: 'Free',
        slug: 'free',
        quota: 5,
        pagesPerPdf: 3,
        price: {
            amount: 0,
            priceIds: {
                test: '',
                production: ''
            }
        }
    },
    {
        name: 'Pro',
        slug: 'pro',
        quota: 50,
        pagesPerPdf: 25,
        price: {
            amount: 10,
            priceIds: {
                test: 'pri_01j31jx8xx3kzd0anptkj6xhs8',
                production: ''
            }
        }
    }
]
