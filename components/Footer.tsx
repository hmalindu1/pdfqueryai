import React from 'react'
import MaxWIdthWrapper from './MaxWIdthWrapper'

const Footer = () => {
    return (
        <footer className="inset-x-0 h-16 bottom-0 z-30 w-full border-t border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
            <MaxWIdthWrapper>
                <div className="flex h-16 items-center justify-center">
                    <p className="text-sm text-gray-500">
                        Crafted with ❤️ by{' '}
                        <a
                            href="https://www.jstodev.com"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Hashan Hemachandra{' '}
                        </a>{' '}
                    </p>
                </div>
            </MaxWIdthWrapper>
        </footer>
    )
}

export default Footer
