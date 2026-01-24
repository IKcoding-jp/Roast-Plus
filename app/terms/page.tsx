'use client';

import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import { TERMS_SECTIONS, TERMS_LAST_UPDATED } from '@/data/legal/terms';

export default function TermsPage() {
  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <Link
                href="/"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                title="戻る"
                aria-label="戻る"
              >
                <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
              </Link>
            </div>
            <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 text-center">
              利用規約
            </h1>
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>

        <main>
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            <p className="text-sm text-gray-500 mb-6">
              最終更新日: {TERMS_LAST_UPDATED}
            </p>

            <div className="space-y-8">
              {TERMS_SECTIONS.map((section, index) => (
                <section key={index}>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    {section.title}
                  </h2>
                  <div className="space-y-2">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                以上
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
