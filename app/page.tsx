/* ================================================================================================ /
 * Title : Home Page
 * Description : Intro will be here
 * Author : Hashan
 * Date : March 8th, 2024 4:43 AM
 /* ================================================================================================ */

import MaxWIdthWrapper from '@/components/MaxWIdthWrapper'

export default function Home() {
    return (
        <MaxWIdthWrapper className="mb-12 mt-28 sm:mb-40 flex flex-col items-center justify-center text-center">
            <div className="mx-auto mb-4 max-w-fit items-center justify-center space-x-2  overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-300 hover:bg-white/50">
                <p className="text-sm font-semibold text-gray-700">
                    Quiz is now public!
                </p>
            </div>
            <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
                Chat with your{' '}
                <span className="text-purple-600">documents</span> in seconds.
            </h1>
            <p className="max-w-prose mt-5 text-zinc-700 sm:text-lg">
                Quiz allows you to have conversations with any PDF document.
                Simply upload your file and start asking questions right away.
            </p>

        </MaxWIdthWrapper>
    )
}
