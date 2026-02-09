import { PRIVACY_POLICY_SECTIONS, PRIVACY_POLICY_LAST_UPDATED } from '@/data/legal/privacy-policy';
import { Card, BackLink } from '@/components/ui';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 bg-page">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <BackLink href="/" variant="icon-only" aria-label="戻る" title="戻る" />
            </div>
            <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-ink sm:flex-1 text-center">
              プライバシーポリシー
            </h1>
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>

        <main>
          <Card className="p-6 sm:p-8">
            <p className="text-sm text-ink-muted mb-6">
              最終更新日: {PRIVACY_POLICY_LAST_UPDATED}
            </p>

            <div className="space-y-8">
              {PRIVACY_POLICY_SECTIONS.map((section, index) => (
                <section key={index}>
                  <h2 className="text-lg font-semibold text-ink mb-3">
                    {section.title}
                  </h2>
                  <div className="space-y-2">
                    {section.content.map((paragraph, pIndex) => (
                      <p
                        key={pIndex}
                        className={`text-ink-sub leading-relaxed ${
                          paragraph === '' ? 'h-2' : ''
                        }`}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-edge">
              <p className="text-sm text-ink-muted text-center">
                以上
              </p>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
