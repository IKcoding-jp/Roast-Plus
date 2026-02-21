import { PRIVACY_POLICY_SECTIONS, PRIVACY_POLICY_LAST_UPDATED } from '@/data/legal/privacy-policy';
import { Card, FloatingNav } from '@/components/ui';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-14 pb-4 sm:pb-6 lg:pb-8 px-4 sm:px-6 lg:px-8 bg-page">
      <FloatingNav backHref="/" />
      <div className="max-w-3xl mx-auto">
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
