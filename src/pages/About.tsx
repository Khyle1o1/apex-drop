import Layout from '@/components/layout/Layout';

export default function About() {
  return (
    <Layout>
      <section className="navy-section">
        <div className="container mx-auto px-4 py-20 md:py-24 text-center">
          <h1 className="font-heading font-black text-3xl md:text-5xl tracking-tight text-primary-foreground">
            About Campus Store
          </h1>
          <p className="mt-5 text-primary-foreground/60 max-w-2xl mx-auto text-lg leading-relaxed">
            Your official school merchandise destination — built with campus pride in every stitch.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto space-y-14">
          <div>
            <h2 className="font-heading font-extrabold text-xl md:text-2xl tracking-tight mb-4">
              Our <span className="text-accent">Mission</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Campus Store was created to give students, alumni, and faculty a place to find premium school merchandise that truly represents our community. Every item is designed with care and crafted with quality materials — because school pride deserves more than a generic print.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Quality First', desc: 'We use premium materials and work with trusted manufacturers to ensure every product lasts.' },
              { title: 'Student-Led', desc: 'Designed by students, for students. Many of our designs come from campus art and design contests.' },
              { title: 'Community Driven', desc: 'A portion of every sale goes back to student organizations and campus improvement projects.' },
            ].map((val) => (
              <div key={val.title} className="p-6 border border-border rounded-xl">
                <h3 className="font-heading font-bold text-sm mb-2 text-destructive">
                  {val.title}
                </h3>
                <p className="text-sm text-muted-foreground">{val.desc}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-heading font-extrabold text-xl md:text-2xl tracking-tight mb-4">
              Visit <span className="text-destructive">Us</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You can find us at Building 5, Ground Floor, University Avenue — right across the student center. We're open Monday to Friday, 8AM–6PM, and Saturdays 9AM–3PM. Come see our latest collections in person!
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
