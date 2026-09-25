import Link from "next/link";
import Globe from "@/components/Globe";
import Gallery from "@/components/Gallery";
import LocPill from "@/components/LocPill";
import { getAllArticles } from "@/lib/articles";
import TestimonialWall from "@/components/TestimonialWall";

const TEASERS = [
  {
    category: "Business",
    title: "Why Small Businesses Need Systems, Not Just Hard Work",
    excerpt: "Hard work without structure just means working the same problems twice.",
  },
  {
    category: "Perspective",
    title: "How Immigrant Families Build Quiet Wealth",
    excerpt: "Patience, ownership, and family — the long game most people never see.",
  },
];

export default function Home() {
  const articles = getAllArticles().slice(0, 3);
  const teasers = TEASERS.slice(0, Math.max(0, 3 - articles.length));

  return (
    <main>
      {/* ================= HERO ================= */}
      <header className="hero" id="top">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow reveal">Operator · Investor · Builder</div>
            <h1 className="reveal" style={{ transitionDelay: ".06s" }}>
              Sakriya<span className="dotmark">.</span>
            </h1>
            <div className="roles reveal" style={{ transitionDelay: ".12s" }}>
              Building <b>local businesses</b>
              <span className="dot">·</span>
              <b>real estate</b>
              <span className="dot">·</span>
              <b>operating systems</b>
            </div>
            <p className="desc reveal" style={{ transitionDelay: ".18s" }}>
              Fast execution, clear communication, and long-term relationships —
              between two homes on opposite sides of the world.
            </p>
            <div className="btn-row reveal" style={{ transitionDelay: ".24s" }}>
              <a className="btn primary" href="#work">View My Work</a>
              <Link className="btn ghost" href="/thoughts">Thoughts</Link>
            </div>
            <LocPill />
          </div>
          <Globe />
        </div>
      </header>


      {/* ================= ABOUT ME ================= */}
      <section id="about">
        <div className="container">
          <div className="eyebrow reveal">About Me</div>
          <h2 className="reveal">Meet the <em>operator</em></h2>
          <div className="about-grid">
            <div className="about-stack">
              <div className="about-line reveal-slow"><span className="num">01</span><span className="txt">Bachelor&apos;s from James Madison University.</span></div>
              <div className="about-line reveal-slow" style={{ transitionDelay: ".06s" }}><span className="num">02</span><span className="txt">MBA at LSUS — <em>in progress, between shifts.</em></span></div>
              <div className="about-line reveal-slow" style={{ transitionDelay: ".12s" }}><span className="num">03</span><span className="txt">Owner-operator of a gas station &amp; convenience store.</span></div>
              <div className="about-line reveal-slow" style={{ transitionDelay: ".18s" }}><span className="num">04</span><span className="txt">Nine rental houses, <em>self-managed.</em></span></div>
              <div className="about-line reveal-slow" style={{ transitionDelay: ".24s" }}><span className="num">05</span><span className="txt">A second store, <em>mid-acquisition.</em></span></div>
              <div className="about-line reveal-slow" style={{ transitionDelay: ".3s" }}><span className="num">06</span><span className="txt">Family legacy: a school and six hydro plants in <em>Nepal.</em></span></div>
              <div className="about-line reveal-slow" style={{ transitionDelay: ".36s" }}><span className="num">07</span><span className="txt">Two homes — <em>Kathmandu &amp; Virginia.</em></span></div>
              <p className="about-kicker reveal-slow" style={{ transitionDelay: ".45s" }}>Young enough to be underestimated. <b>Organized enough not to care.</b></p>
              <p className="about-sig reveal-slow" style={{ transitionDelay: ".52s" }}>— Sakriya</p>
            </div>
            <div className="about-photos reveal" style={{ transitionDelay: ".15s" }}>
              <Gallery setKey="sakriya" label="sakriya" frameClass="pframe glass big" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED WORK (ledger layout) ================= */}
      <section id="work">
        <div className="container">
          <div className="split-heading section-heading">
            <div>
              <div className="eyebrow reveal">Featured Work</div>
              <h2 className="reveal">Real projects, <em>real execution</em></h2>
            </div>
            <p className="lede reveal">Not a resume — a working record of what&apos;s actually being built and run.</p>
          </div>
          <div className="work-ledger">
            {[
              { category: "Operations", title: "Food Mart", body: "Owner-operator of a gas station and convenience store — daily execution, employee systems, vendor management, and money services.", chips: ["Open daily", "Owner-operator"], live: true },
              { category: "Acquisition", title: "Business Expansion", body: "Acquiring a second store — entity structuring, due diligence, LOIs, financing coordination, and transition planning from the ground up.", milestone: true },
              { category: "Real Estate", title: "Rental Portfolio", body: "Nine houses in Virginia — owned and managed directly. Screening, leases, maintenance systems, and tenant relationships built to last multiple lease cycles.", chips: ["9 houses", "Owner-managed", "Virginia"] },
              { category: "Property Improvement", title: "Site & Facility Upgrades", body: "Parking lot and facility improvement projects — coordinating contractor bids, scope, timelines, and quality through completion.", chips: ["Project manager"] },
              { category: "Automation", title: "Store Ops, Automated", body: "A Discord operations hub built for the store — schedules generate themselves, an AI assistant solves most problems employees hit on the job, opening and closing checklists hold every shift accountable, and fuel reporting runs on autopilot. Less time behind the counter, more time building.", chips: ["Running daily", "AI + Discord"], live: true },
              { category: "Legacy", title: "Education & Energy", body: "Our family runs Valley Public School in Nepal and is deeply invested in the country's energy future, with stakes in more than six hydroelectric power plants.", chips: ["Education", "Hydropower", "Nepal"] },
            ].map((item, index) => (
              <article className={`work-record glass work-record-${index + 1} reveal`} data-tilt key={item.title}>
                <span className="glare" />
                <div className="record-topline">
                  <span className="tag">{item.category}</span>
                  <span className="record-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                {item.milestone && (
                  <div className="milestones" aria-label="LOI to Close" style={{ marginTop: "auto", paddingTop: 24 }}>
                    <span className="step done" /><span className="bar done" />
                    <span className="step done" /><span className="bar done" />
                    <span className="step now" /><span className="bar" />
                    <span className="step" />
                    <span className="mlabel">LOI → Close</span>
                  </div>
                )}
                {item.chips && (
                  <div className="meta">
                    {item.chips.map((chip, ci) => (
                      <span className={`chip ${item.live && ci === 0 ? "live" : ""}`} key={chip}>{chip}</span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <TestimonialWall />

      {/* ================= PUNTE ================= */}
      <section id="punte">
        <div className="container">
          <div className="punte-head">
            <div className="eyebrow reveal" style={{ justifyContent: "center" }}>The Boss</div>
            <h2 className="reveal">Punte<span style={{ color: "var(--ember)" }}>.</span></h2>
            <p className="sub reveal">My baby since March 20, 2022.</p>
          </div>
          <div className="punte-grid">
            <div className="punte-photos">
              <Gallery setKey="punte" label="punte" frameClass="pframe glass big" />
            </div>
            <div className="punte-copy">
              <p className="kicker reveal-slow">People assume I&apos;m a dog person — that I see one on the street and lose my mind. I&apos;m not.</p>
              <p className="reveal-slow">I love <b>Punte</b>. That&apos;s mostly where it ends. I think a lot of dogs smell. Some are loud and annoying. Some are genuinely aggressive — I&apos;ve been bitten enough times to lose count of the rabies and tetanus shots.</p>
              <p className="reveal-slow">But none of that means they deserve cruelty. Being annoying, or dirty, or even dangerous isn&apos;t a reason to throw rocks at something, or beat it with an iron rod, for the crime of existing.</p>
              <p className="reveal-slow">Punte lives like a king. I walk him. I spoil him — beef tallow, ghee, the most expensive treats I can find. When it rains, he&apos;s inside. When there&apos;s danger, he&apos;s inside. He has only ever known <b>full bellies and clear skies</b>.</p>
              <p className="reveal-slow">Then I go back to Kathmandu and I see the other dogs. Rocks thrown at them. Run over in the street. Thirsty and hungry, scavenging through dumpsters in one of the most crowded cities on earth.</p>
              <p className="reveal-slow">And you start to ask the obvious question: <b>why not them?</b> What did Punte do to deserve this life, when they did nothing to deserve theirs?</p>
              <p className="reveal-slow">I don&apos;t have a clean answer. But the question changed me. I used to see almost every relationship as a transaction — what can I get, what can they get. I still think that way more than I&apos;d like to admit. Punte pulled some of it loose. He made me care about lives I have nothing to gain from.</p>
              <p className="reveal-slow">Since 2022 I&apos;ve been sending money to the people in Nepal who feed and nurse these street dogs — my kind-hearted brothers and sisters doing the work on the ground. One day, when I&apos;ve built enough, I want to open something real for them. Somewhere those dogs get to be warm and full too.</p>
              <p className="reveal-slow">It&apos;s also the honest answer to why I work the way I do at my age — the store hours, the deals, the nine houses, the MBA between shifts. I&apos;m not building all this because I love being tired. I&apos;m building it so that one day, when it&apos;s time to give back on a scale that matters, <b>I can</b>.</p>
              <p className="closer reveal-slow">He&apos;s just a dog. But he reminded me how lucky I am — and that luck should cost me something.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= JOURNAL ================= */}
      <section id="journal">
        <div className="container">
          <div className="eyebrow reveal">Journal</div>
          <h2 className="reveal">Two homes, <em>one life</em></h2>
          <p className="lede reveal">Kathmandu and Virginia. The store, the family, the dog, the road between.</p>
          <div className="journal-grid">
            <Gallery setKey="nepalcity" label="nepal / kathmandu" frameClass="jframe glass" />
            <Gallery setKey="punte" label="punte / walks" frameClass="jframe glass" delay=".05s" />
            <Gallery setKey="store" label="food mart / on site" frameClass="jframe glass" delay=".1s" />
            <Gallery setKey="re" label="rentals / renovations" frameClass="jframe glass" delay=".15s" />
            <Gallery setKey="nepalhydro" label="himalaya / hydro" frameClass="jframe glass" delay=".2s" />
          </div>
        </div>
      </section>

      {/* ================= THOUGHTS ================= */}
      <section id="thoughts">
        <div className="container">
          <div className="eyebrow reveal">Thoughts</div>
          <h2 className="reveal">Rants, <em>refined</em></h2>
          <p className="lede reveal">Operating, real estate, immigration, building — whatever&apos;s on my mind, written down properly.</p>
          <div className="grid cols-3">
            {articles.map((a, i) => (
              <Link
                key={a.slug}
                className="post card glass reveal"
                href={`/thoughts/${a.slug}`}
                data-tilt
                style={i ? { transitionDelay: `.0${i * 7}s` } : undefined}
              >
                <span className="glare" />
                <div className="cat">{a.category}</div>
                <h3>{a.title}</h3>
                <p>{a.excerpt}</p>
                <span className="read">Read</span>
              </Link>
            ))}
            {teasers.map((t, i) => (
              <div
                key={t.title}
                className="post card glass reveal teaser"
                data-tilt
                style={{ transitionDelay: `.0${(articles.length + i) * 7}s` }}
              >
                <span className="glare" />
                <div className="cat">{t.category}</div>
                <h3>{t.title}</h3>
                <p>{t.excerpt}</p>
                <span className="read">Coming soon</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT + PRINCIPLES ================= */}
      <section id="contact" style={{ paddingBottom: 40 }}>
        <div className="container">
          <div className="contact-card glass reveal" id="contact-glass">
            <div className="eyebrow" style={{ justifyContent: "center" }}>Contact</div>
            <h2>Interested in <em>working together?</em></h2>
            <p className="lede" style={{ textAlign: "center" }}>
              For business, property, contracting, vendor, tenant, or partnership
              conversations — feel free to reach out.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <a className="btn primary" href="mailto:sakriyacorp@gmail.com">Email Me</a>
              <a className="btn ghost" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                Facebook — Sakriya
              </a>
            </div>
          </div>
          <div className="principles-row reveal">
            <span className="pchip glass"><b>Fast</b> communication</span>
            <span className="pchip glass"><b>Clear</b> expectations</span>
            <span className="pchip glass"><b>Hands-on</b> problem solving</span>
            <span className="pchip glass">Respect for <b>time</b></span>
            <span className="pchip glass"><b>Long-term</b> relationships</span>
            <span className="pchip glass"><b>Systems</b> over chaos</span>
          </div>
        </div>
      </section>
    </main>
  );
}
