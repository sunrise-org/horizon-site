import Link from "next/link";
import type { ReactNode } from "react";
import { pageMetadata } from "@/components/site";

export const metadata = pageMetadata({
  title: "Privacy · Sunrise",
  description: "What this website keeps about you: no cookies for visitors, no analytics, a hashed count of release views and the performance captures you upload.",
  path: "/privacy",
});

const LINK = "text-[#c4b5ff] underline decoration-[#c4b5ff]/40 underline-offset-4 transition-colors hover:text-white";

function Part({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-[1.6rem] leading-tight font-semibold tracking-[-0.02em] text-white">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main>
      <article className="mx-auto w-full max-w-3xl px-6 pt-32 pb-20 text-[16px] leading-relaxed text-pretty text-white/70 sm:pt-40 sm:pb-28 lg:px-10">
        <p className="text-sm font-medium text-white/60">Privacy</p>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1.04] font-semibold tracking-[-0.035em] text-white">
          <span className="block">This site keeps</span>
          <span className="text-accent block pb-1">almost nothing.</span>
        </h1>
        <p className="mt-6 text-lg text-white/70">What this website keeps about you, and what it doesn&apos;t.</p>

        <Part title="In short">
          <ul className="list-disc space-y-2 pl-5 marker:text-white/30">
            <li>No cookies for visitors, no analytics, no trackers and no ads.</li>
            <li>Opening a release stores a keyed hash of your IP address, so each release counts each visitor once.</li>
            <li>Signing in, where a deployment offers it, sets a session cookie from the service you sign in to.</li>
            <li>Uploading a performance capture stores the file you upload, and a hash of your IP address for rate limiting.</li>
          </ul>
        </Part>

        <Part title="Release views">
          <p>
            Each release on <Link href="/releases" className={LINK}>Releases</Link> shows how many people opened it. When you open one, the server turns
            your IP address into a hash with a secret key that stays on the server, and keeps that hash next to the release. The address itself is not
            stored, the same address opening the same release again counts once, and only the number of views is shown.
          </p>
        </Part>

        <Part title="Signing in">
          <p>
            The staff dashboards and the mod registry&apos;s sign-in are services this site passes your requests on to; they are configured per deployment.
            When you sign in, the cookie that service sets is passed back to your browser and sent only with later requests to the same service. This
            site keeps no account of its own.
          </p>
        </Part>

        <Part title="Performance captures">
          <p>
            Opening a <code className="font-mono text-[0.9em] text-[#e7e1ff]">.hzperf</code> file on <Link href="/perf" className={LINK}>/perf</Link> reads it
            in your browser and uploads nothing. <strong className="font-medium text-white/85">Share</strong> asks first, then uploads the file as it is.
            The capture is stored for one hour; if you share it, it is kept for 30 days. The server also keeps a SHA-256 hash of your IP address for an
            hour to limit uploads per address, and a hash of the delete token your browser receives. The token itself stays in your browser&apos;s session
            storage and lets you delete the capture. A capture can name the world, the players, the mods and the machine it was recorded on: check what
            it contains before you share it.
          </p>
        </Part>

        <Part title="What stays in your browser">
          <p>
            A few choices are kept in your browser&apos;s local or session storage and are never sent to the server: which releases you have opened, that
            you hid the partner banner, whether the Hub reads in simple or technical words, and short-lived notes while you fill in an application or a
            share.
          </p>
        </Part>

        <Part title="What the server fetches">
          <p>
            To show releases, the roadmap, contributors and mods, the server fetches them from GitHub and, where configured, from the mod registry and
            the telemetry service. Those requests carry nothing about you. Downloads link to github.com, which has its own{" "}
            <a
              href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noreferrer"
              className={LINK}
            >
              privacy statement
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </Part>

        <Part title="Questions">
          <p>
            Ask what this site holds about you, or have it deleted, by opening an issue on{" "}
            <a href="https://github.com/sunrise-org/horizon-site/issues" className={LINK}>
              sunrise-org/horizon-site
            </a>
            . Because only hashes of addresses are kept, include the IP address you used so the entry can be found.
          </p>
        </Part>
      </article>
    </main>
  );
}
