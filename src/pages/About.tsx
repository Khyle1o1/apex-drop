import Layout from '@/components/layout/Layout';

export default function About() {
  return (
    <Layout>
      <section className="navy-section">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-heading font-black text-4xl md:text-6xl uppercase tracking-tight text-primary-foreground">
            Our Story
          </h1>
          <p className="mt-6 text-primary-foreground/60 max-w-2xl mx-auto text-lg leading-relaxed">
            Born from the drive to compete. Built for athletes who demand excellence.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto space-y-16">
          <div>
            <h2 className="font-heading font-extrabold text-2xl uppercase tracking-tight mb-4">
              The <span className="text-accent">Mission</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Apex was founded with a singular vision: create performance gear that matches the intensity of competitive athletes. We don't make lifestyle fashion. We engineer tools for the court, the field, and the arena.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Performance First', desc: 'Every material, seam, and design choice is driven by athletic performance.' },
              { title: 'Relentless Innovation', desc: 'We test, iterate, and refine with pro athletes before any product hits the shelf.' },
              { title: 'Community Driven', desc: 'Built by players, for players. Our community shapes every collection.' },
            ].map((val) => (
              <div key={val.title} className="p-6 border border-border rounded-card">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wide mb-2 text-destructive">
                  {val.title}
                </h3>
                <p className="text-sm text-muted-foreground">{val.desc}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-heading font-extrabold text-2xl uppercase tracking-tight mb-4">
              The <span className="text-destructive">Team</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We're a small team of former athletes, designers, and engineers based in Austin, TX. We play the sports we design for—every single day. When we're not in the office, we're on the court testing our latest prototypes.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
