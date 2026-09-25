import { Logo } from "@/components/brand/Logo";

export default function HomePage() {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 pt-24">
      <div aria-hidden="true" className="lamp-glow left-1/2 top-1/3 h-[60vmin] w-[60vmin] -translate-x-1/2" />
      <div className="relative grid w-full max-w-5xl gap-10 md:grid-cols-2">
        <div className="brass sheen flex aspect-square items-center justify-center rounded-md p-10">
          <Logo variant="lockup" material="engraved" animate orb="sun" className="w-full" />
        </div>
        <div className="paper flex aspect-square items-center justify-center rounded-md p-10">
          <Logo variant="lockup" material="foil" animate delay={0.3} className="w-full" />
        </div>
      </div>
    </section>
  );
}
