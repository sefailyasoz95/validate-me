import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";

export default function TermsPage() {
  return (
    <main
      className="min-h-screen bg-gradient-to-br from-indigo-100/50 via-background to-purple-100/50 
      dark:from-indigo-950/50 dark:via-background dark:to-purple-950/50"
    >
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link href="/login">
            <IoArrowBack className="w-4 h-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-16">
        <div className="bg-card/50 backdrop-blur-sm border-border/50 rounded-lg p-6 md:p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By accessing and using ValidateMe, you agree to be bound by
                these Terms of Service. If you do not agree to these terms,
                please do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                2. Description of Service
              </h2>
              <p className="leading-relaxed">
                ValidateMe is a platform that allows users to create and share
                polls to validate business ideas. Users can create structured
                polls with predefined answers and share them with others for
                feedback.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                3. User Responsibilities
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  You must provide accurate information when using the service
                </li>
                <li>
                  You are responsible for maintaining the security of your
                  account
                </li>
                <li>
                  You agree not to use the service for any illegal or
                  unauthorized purpose
                </li>
                <li>You must respect the privacy and rights of other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                4. Data Privacy
              </h2>
              <p className="leading-relaxed">
                We collect and process personal data in accordance with our
                Privacy Policy. By using our service, you consent to such
                processing and warrant that all data provided by you is
                accurate.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                5. Intellectual Property
              </h2>
              <p className="leading-relaxed">
                The service and its original content, features, and
                functionality are owned by ValidateMe and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                6. Termination
              </h2>
              <p className="leading-relaxed">
                We may terminate or suspend your account and bar access to the
                service immediately, without prior notice or liability, under
                our sole discretion, for any reason whatsoever.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                7. Changes to Terms
              </h2>
              <p className="leading-relaxed">
                We reserve the right to modify or replace these terms at any
                time. If a revision is material, we will provide at least 30
                days notice prior to any new terms taking effect.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
