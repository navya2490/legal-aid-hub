import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Scale,
  ArrowRight,
  Shield,
  Users,
  FileText,
  DollarSign,
  Activity,
  Globe,
  Zap,
  CheckCircle,
  Mail,
  Phone,
  MessageCircle,
  Menu,
  X,
  Twitter,
  Linkedin,
  Facebook,
  Star,
  Award,
  Play,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useToast } from "@/hooks/use-toast";

const features = [
  { icon: Scale, title: "Smart Lawyer Matching", desc: "Our AI-powered algorithm matches you with advocates specializing in your exact legal issue — across all Indian courts and tribunals." },
  { icon: DollarSign, title: "Transparent Pricing", desc: "Know costs upfront in ₹. No hidden fees. Pay only for the services you need with UPI, cards, or net banking." },
  { icon: Shield, title: "Secure Document Sharing", desc: "Bank-level encryption protects your sensitive legal documents and Aadhaar/PAN information." },
  { icon: Activity, title: "Real-Time Case Tracking", desc: "Monitor your case progress 24/7 with instant notifications and status updates across District, High Court, and Supreme Court matters." },
  { icon: Users, title: "Expert Consultation", desc: "Access to 500+ verified advocates across 12 legal specializations, registered with the Bar Council of India." },
  { icon: Globe, title: "Multi-Language Support", desc: "Get legal help in Hindi, English, Tamil, Telugu, Bengali, Marathi, and more regional languages." },
];

const steps = [
  { icon: FileText, step: "01", title: "Submit Your Case", desc: "Fill out our simple form describing your legal issue. Takes less than 5 minutes. Upload relevant documents securely." },
  { icon: Zap, step: "02", title: "Get Matched", desc: "Our intelligent system analyzes your case and matches you with the most qualified advocate based on expertise, jurisdiction, availability, and urgency." },
  { icon: CheckCircle, step: "03", title: "Resolve Your Case", desc: "Communicate directly with your advocate, track progress in real-time, and get your legal matters resolved efficiently." },
];

const differentiators = [
  { title: "Instant Matching vs. Days of Searching", desc: "Traditional methods make you wait days for referrals. We match you with a qualified advocate in minutes using smart algorithms." },
  { title: "Transparent Costs vs. Hidden Fees", desc: "No surprise bills. See advocate fees upfront in ₹. Pay only for time spent on your case." },
  { title: "Specialized Expertise vs. General Practice", desc: "Get matched with advocates who specialize in your exact issue — from family law to cyber crime and consumer protection." },
  { title: "24/7 Access vs. Office Hours", desc: "Submit cases, upload documents, and communicate anytime. Your legal help doesn't keep office hours." },
  { title: "Pan-India Coverage vs. Local Only", desc: "Access advocates across all Indian states and union territories. District courts to Supreme Court — we've got you covered." },
];

const stats = [
  { icon: Award, value: "1,000+", label: "Cases Resolved" },
  { icon: Users, value: "500+", label: "Verified Advocates" },
  { icon: Scale, value: "12", label: "Legal Specializations" },
  { icon: Star, value: "95%", label: "Client Satisfaction" },
];

const faqs = [
  { q: "How does advocate matching work?", a: "Our platform uses a smart matching algorithm that considers your legal issue category, urgency level, jurisdiction, and preferred language to pair you with the most qualified and available advocate from our BCI-verified network." },
  { q: "How much does it cost?", a: "We believe in transparent pricing. There are no platform fees to submit a case. Advocate fees are displayed upfront in ₹ before you confirm any engagement. We accept UPI, credit/debit cards, and net banking." },
  { q: "Is my information secure?", a: "Absolutely. We use bank-level AES-256 encryption for all data. Your documents, Aadhaar, PAN, and personal information are never shared without your explicit consent, in compliance with India's IT Act and Digital Personal Data Protection Act." },
  { q: "What types of cases do you handle?", a: "We cover 12 legal specializations: Family Law, Criminal Law, Civil Litigation, Employment Law, Real Estate Law, Business & Corporate Law, Immigration Law, Intellectual Property, Tax Law (GST/Income Tax), Estate Planning, Personal Injury, and Consumer Protection." },
  { q: "How long does it take to get matched?", a: "Most clients are matched with a qualified advocate within minutes of submitting their case. For highly specialized or urgent matters (bail applications, stay orders), our team ensures priority matching." },
  { q: "Is this service available across India?", a: "Yes! Legal Aid Hub serves clients across all 28 states and 8 union territories. Our advocates are registered with the Bar Council of India and various State Bar Councils." },
];

const GeoBlockedPage = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-4">
    <div className="text-center max-w-md space-y-4">
      <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
      <h1 className="text-2xl font-bold text-foreground">Service Unavailable in Your Region</h1>
      <p className="text-muted-foreground">
        Legal Aid Hub is currently available only to users in India. We're working on expanding to other regions in the future.
      </p>
      <p className="text-sm text-muted-foreground">
        If you believe this is an error, please contact us at{" "}
        <a href="mailto:support@legalaidhub.in" className="text-primary underline">support@legalaidhub.in</a>
      </p>
    </div>
  </div>
);

const Index = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [geoStatus, setGeoStatus] = useState<"loading" | "allowed" | "blocked">("loading");

  useEffect(() => {
    const checkGeo = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setGeoStatus(data.country_code === "IN" ? "allowed" : "blocked");
      } catch {
        // If geo check fails, allow access (fail-open)
        setGeoStatus("allowed");
      }
    };
    checkGeo();
  }, []);

  useEffect(() => {
    if (user && role) {
      const dashboardMap: Record<string, string> = {
        client: "/dashboard/client",
        lawyer: "/dashboard/lawyer",
        admin: "/dashboard/admin",
      };
      if (dashboardMap[role]) navigate(dashboardMap[role], { replace: true });
    }
  }, [user, role, navigate]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "How It Works", id: "how-it-works" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" },
  ];

  if (geoStatus === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (geoStatus === "blocked") {
    return <GeoBlockedPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Legal Aid Hub</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-1">
              🇮🇳 India
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <Link to="/login" className="hidden md:inline-flex">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register" className="hidden md:inline-flex">
              <Button size="sm">Get Started</Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 pb-4 space-y-2">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-foreground">
                {l.label}
              </button>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">Sign In</Button></Link>
              <Link to="/register" className="flex-1"><Button className="w-full" size="sm">Get Started</Button></Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/30 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--portal-blue)/0.08),transparent_70%)]" />
        <div className="container relative mx-auto px-4 py-20 md:py-32 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-warning" />
              Trusted by 1,000+ clients across India
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Access Legal Help When You{" "}
              <span className="text-primary">Need It Most</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              Connect with qualified advocates instantly. Submit your case online, get matched with expert lawyers registered with the Bar Council of India, and track everything in one secure platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link to="/login">
                <Button size="lg" className="gap-2 w-full sm:w-auto text-base px-8">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto text-base px-8" onClick={() => scrollTo("features")}>
                <Play className="h-4 w-4" /> Watch Demo
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> 1,000+ Cases Resolved</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> 500+ BCI-Verified Advocates</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> Pan-India Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Features</p>
          <h2 className="text-3xl font-bold md:text-4xl">Everything You Need for Legal Support</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="border border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Process</p>
            <h2 className="text-3xl font-bold md:text-4xl">Simple 3-Step Process</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  {s.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] border-t-2 border-dashed border-border" />
                )}
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Why Us</p>
          <h2 className="text-3xl font-bold md:text-4xl">Why Choose Legal Aid Hub?</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((d, i) => (
            <Card key={i} className="border border-border bg-card">
              <CardContent className="p-6 space-y-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-card-foreground">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">About</p>
            <h2 className="text-3xl font-bold md:text-4xl">Our Mission</h2>
            <div className="space-y-4 text-muted-foreground text-left md:text-center leading-relaxed">
              <p>
                Legal Aid Hub was founded in 2024 with a simple belief: every Indian citizen deserves access to quality legal help, regardless of their location or budget. Traditional legal services in India are often expensive, slow, and intimidating. We're changing that.
              </p>
              <p>
                Our platform connects individuals and small businesses across India with qualified advocates instantly, using technology to make legal help affordable and accessible. We've helped over 1,000 clients resolve cases ranging from property disputes and consumer complaints to family law matters and GST issues.
              </p>
              <p>
                Built by a team of legal professionals and technologists based in India, Legal Aid Hub combines deep expertise in Indian law with modern technology to deliver a better experience for both clients and advocates. All our advocates are registered with the Bar Council of India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="border border-border bg-card text-center">
              <CardContent className="p-8 space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-card-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">FAQ</p>
            <h2 className="text-3xl font-bold md:text-4xl">Need Help?</h2>
          </div>
          <div className="mx-auto max-w-2xl">
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg bg-card px-4">
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Contact</p>
          <h2 className="text-3xl font-bold md:text-4xl">Get In Touch</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3 mb-12">
          {[
            { icon: Mail, title: "Email", info: "support@legalaidhub.in", sub: "We respond within 24 hours" },
            { icon: Phone, title: "Phone", info: "+91 11 4567 8900", sub: "Mon-Sat 9AM-7PM IST" },
            { icon: MessageCircle, title: "Live Chat", info: "Chat with our team", sub: "Avg response: 2 minutes" },
          ].map((c) => (
            <Card key={c.title} className="border border-border bg-card text-center">
              <CardContent className="p-6 space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-card-foreground">{c.title}</h3>
                <p className="text-sm font-medium text-foreground">{c.info}</p>
                <p className="text-xs text-muted-foreground">{c.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mx-auto max-w-lg border border-border bg-card">
          <CardContent className="p-6">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" required value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} placeholder="How can we help?" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" required rows={4} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} placeholder="Tell us more..." />
              </div>
              <Button type="submit" className="w-full">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <span className="font-bold">Legal Aid Hub</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Making legal help accessible, affordable, and efficient for every Indian citizen.</p>
              <div className="flex gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Twitter className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Linkedin className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Facebook className="h-4 w-4" /></Button>
              </div>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "For Advocates", "For Clients"] },
              { title: "Company", links: ["About Us", "Careers", "Blog", "Press"] },
              { title: "Legal", links: ["Terms of Service", "Privacy Policy", "Cookie Policy"] },
              { title: "Support", links: ["Help Center", "Contact Us", "Status"] },
            ].map((col) => (
              <div key={col.title} className="space-y-3">
                <h4 className="text-sm font-semibold">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><button className="text-xs text-muted-foreground hover:text-foreground transition-colors">{l}</button></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            © 2024 Legal Aid Hub. All rights reserved. Registered in India.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
