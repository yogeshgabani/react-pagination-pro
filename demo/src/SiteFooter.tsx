import { AUTHOR, LAST_UPDATED, LINKS, SiteLink } from "./links";
import { BrandIcon } from "./BrandIcon";
import { useSiteStats } from "./useSiteStats";

const AUTHOR_FIRST = AUTHOR.split(" ")[0];

/** Stroked line icons for the stat cards. */
const STAT_ICONS: Record<string, JSX.Element> = {
  calendar: (
    <>
      <path d="M8 2v4M16 2v4M3 10h18" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      <circle cx="9" cy="7" r="4" />
    </>
  ),
};

const StatIcon = ({ name }: { name: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {STAT_ICONS[name]}
  </svg>
);

type LinkDef = { key: keyof typeof LINKS; label: string };

const ACTIONS: LinkDef[] = [
  { key: "github", label: "GitHub" },
  { key: "npm", label: "npm" },
];

const SOCIALS: LinkDef[] = [
  { key: "whatsapp", label: "WhatsApp" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "x", label: "X" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
];

const formatDate = (raw?: string) => {
  if (!raw) return undefined;
  const d = new Date(raw);
  return Number.isNaN(d.getTime())
    ? raw
    : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

export function SiteFooter({ variantCount }: { variantCount: number }) {
  // Counted automatically on each visit; null until the service answers.
  const { hits, visitors } = useSiteStats();
  const num = (n: number | null) => (n === null ? undefined : n.toLocaleString());

  const stats = [
    { key: "calendar", label: "Last updated", value: formatDate(LAST_UPDATED) },
    { key: "eye", label: "Total hits", value: num(hits) },
    { key: "users", label: "Total visitors", value: num(visitors), live: true },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-wrap">
        {/* ---- Brand card ---- */}
        <div className="fcard">
          <div className="fcard-row">
            <div className="fbrand">
              <span className="fbrand-logo" aria-hidden="true">
                <i /><i /><i />
              </span>
              <div>
                <strong>react-next-pagination-pro</strong>
                <p>Modern, accessible pagination library for React &amp; Next.js</p>
              </div>
            </div>
            <div className="factions">
              {ACTIONS.map((a) => (
                <SiteLink key={a.key} url={LINKS[a.key]} label={a.label} className="fbtn">
                  <BrandIcon name={a.key} />
                  {a.label}
                </SiteLink>
              ))}
              <a className="fbtn" href="#top">🎨 Browse variants</a>
            </div>
          </div>

          <div className="fcard-div" />

          <div className="fcard-row">
            <p className="fconnect">
              <span className="fconnect-lead">Connect with {AUTHOR_FIRST}</span>
              <span className="fconnect-dash">—</span>
              <span className="fconnect-sub">follow for updates &amp; new variants</span>
            </p>
            <div className="fsocials">
              {SOCIALS.map((s, i) => (
                <SiteLink key={`${s.key}-${i}`} url={LINKS[s.key]} label={s.label} className="fsocial">
                  <BrandIcon name={s.key} size={15} />
                </SiteLink>
              ))}
            </div>
          </div>

          <div className="fcard-div" />

          <div className="fcard-row">
            <div className="fmeta">
              <p className="fmeta-line">
                <span className="fbadge">MIT</span>
                <span className="fdot">·</span>
                <span>© {new Date().getFullYear()} react-next-pagination-pro</span>
                <span className="fdot">·</span>
                <span><b>{variantCount}</b> variants</span>
              </p>
              <p className="fmeta-sub">
                Crafted with <span className="fheart">♥</span> for the React &amp; Next.js community
              </p>
            </div>
            <SiteLink
              url={LINKS.author}
              label={`${AUTHOR}’s profile`}
              title={`Built by ${AUTHOR}`}
              className="fbuilt"
            >
              Built by <span>{AUTHOR}</span> <span aria-hidden="true">↗</span>
            </SiteLink>
          </div>
        </div>

        {/* ---- Stat cards ---- */}
        <div className="fstats">
          {stats.map((s) => (
            <div className="fstat" key={s.key}>
              <span className="fstat-icon"><StatIcon name={s.key} /></span>
              <div className="fstat-body">
                <span className="fstat-label">
                  {s.label}
                  {s.live && s.value && <em className="fstat-live">● Live</em>}
                </span>
                <strong className="fstat-value">{s.value ?? "—"}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
