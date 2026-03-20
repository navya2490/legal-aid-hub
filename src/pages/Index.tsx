import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Scale,
  ArrowRight,
  Shield,
  Users,
  FileText,
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
  Gavel,
  Languages,
  Building2,
  UserCheck,
  BadgeCheck,
  IndianRupee,
  Map,
  BookOpen,
  MonitorSmartphone,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useToast } from "@/hooks/use-toast";

const features = [
  { icon: Zap, title: "Smart Advocate Matching", desc: "Get matched with lawyers registered with Bar Council of India, specializing in your exact legal matter." },
  { icon: Map, title: "Pan-India Coverage", desc: "Access legal help across all 28 states and 8 union territories." },
  { icon: Shield, title: "Secure Document Vault", desc: "Bank-level encryption for Aadhaar, PAN, and sensitive legal documents." },
  { icon: Activity, title: "Real-Time Case Tracking", desc: "Monitor your case status with instant WhatsApp and SMS notifications." },
  { icon: BookOpen, title: "Indian Law Expertise", desc: "Specialists in IPC, CPC, CrPC, Indian Constitution, and special laws." },
  { icon: Languages, title: "Multi-Language Support", desc: "Get help in Hindi, English, and 10+ regional languages." },
];

const steps = [
  { icon: FileText, step: "01", title: "Submit Your Case", desc: "Describe your legal issue. Upload Aadhaar/PAN if needed. Takes 5 minutes." },
  { icon: UserCheck, step: "02", title: "Get Matched", desc: "Our system matches you with Bar Council registered advocates based on expertise and location." },
  { icon: CheckCircle, step: "03", title: "Resolve Your Case", desc: "Track your case from filing to judgment with real-time updates." },
];

const differentiators = [
  { icon: Globe, title: "All-India Access vs. Local Limitations", desc: "Get expert help whether you're in Mumbai or a tier-3 city." },
  { icon: IndianRupee, title: "Fixed Fees vs. Unpredictable Costs", desc: "Know costs upfront in INR. No hidden charges." },
  { icon: Gavel, title: "Specialized in Indian Laws", desc: "Experts in IPC, Family Law, Consumer Protection Act, GST, Labour Laws, Property Laws." },
  { icon: MonitorSmartphone, title: "Digital-First vs. Court-Running", desc: "Submit cases, upload documents, communicate online. Save trips to lawyer offices." },
  { icon: BadgeCheck, title: "Verified Advocates Only", desc: "All lawyers verified with Bar Council of India registration." },
];

const stats = [
  { icon: Award, value: "1,000+", label: "Cases Resolved" },
  { icon: Users, value: "500+", label: "Verified Advocates" },
  { icon: Map, value: "28", label: "States Covered" },
  { icon: BookOpen, value: "12", label: "Legal Domains" },
  { icon: Star, value: "95%", label: "Resolution Rate" },
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
  const [demoOpen, setDemoOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [geoStatus, setGeoStatus] = useState<"loading" | "allowed" | "blocked">("loading");

  useEffect(() => {
    const checkGeo = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setGeoStatus(data.country_code === "IN" ? "allowed" : "blocked");
      } catch {
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
    { label: "For Advocates", id: "portals" },
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
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <Link to="/admin-login" className="hidden md:inline-flex">
              <Button variant="ghost" size="sm">Admin Portal</Button>
            </Link>
            <Link to="/login" className="hidden md:inline-flex">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/login" className="hidden md:inline-flex">
              <Button size="sm">Get Started</Button>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background px-4 pb-4 space-y-2">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="block w-full text-left py-2 text-sm text-muted-foreground hover:text-foreground">
                {l.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/admin-login"><Button variant="ghost" className="w-full" size="sm">Admin Portal</Button></Link>
              <Link to="/login"><Button variant="outline" className="w-full" size="sm">Sign In</Button></Link>
              <Link to="/login"><Button className="w-full" size="sm">Get Started</Button></Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-portal-blue/10 to-background">
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
              Connect with qualified advocates instantly. Submit your case online, get matched with expert lawyers across India, and track everything in one secure platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link to="/login">
                <Button size="lg" className="gap-2 w-full sm:w-auto text-base px-8">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/admin-login">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto text-base px-8">
                  <Building2 className="h-4 w-4" /> Admin Portal
                </Button>
              </Link>
              <Button size="lg" variant="ghost" className="gap-2 w-full sm:w-auto text-base px-8" onClick={() => setDemoOpen(true)}>
                <Play className="h-4 w-4" /> Watch Demo
              </Button>
            </div>

            {/* Hero Illustration - Scale of Justice */}
            <div className="pt-8 flex justify-center">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(25,100%,50%)] via-[hsl(0,0%,100%)] to-[hsl(120,60%,35%)] opacity-20" />
                <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                  <Scale className="h-16 w-16 md:h-20 md:w-20 text-primary" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> 1,000+ Cases Resolved</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> 500+ Verified Advocates</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> 28 States Covered</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> Available in Hindi & English</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Features</p>
          <h2 className="text-3xl font-bold md:text-4xl">Complete Legal Support Across India</h2>
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

      {/* WHAT MAKES US DIFFERENT */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Why Us</p>
          <h2 className="text-3xl font-bold md:text-4xl">What Makes Us Different</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((d, i) => (
            <Card key={i} className="border border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <d.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-card-foreground">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* USER ROLES / PORTALS */}
      <section id="portals" className="bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Portals</p>
            <h2 className="text-3xl font-bold md:text-4xl">Choose Your Portal</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Three dedicated portals designed for every stakeholder in the legal process.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Client Portal</h3>
                <p className="text-sm text-muted-foreground">For individuals and businesses seeking legal help. Submit cases, track progress, and communicate with advocates.</p>
                <Link to="/client-login">
                  <Button variant="outline" className="w-full mt-2">Access Client Portal</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Gavel className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Advocate Portal</h3>
                <p className="text-sm text-muted-foreground">For Bar Council registered lawyers. Manage cases, communicate with clients, and grow your practice.</p>
                <Link to="/lawyer-login">
                  <Button variant="outline" className="w-full mt-2">Access Advocate Portal</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Admin Portal</h3>
                <p className="text-sm text-muted-foreground">For platform administrators. Requires Employee ID. Manage cases, advocates, and platform operations.</p>
                <Link to="/admin-login">
                  <Button variant="outline" className="w-full mt-2">Access Admin Portal</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">About</p>
          <h2 className="text-3xl font-bold md:text-4xl">Making Justice Accessible Across India</h2>
          <div className="space-y-4 text-muted-foreground text-left md:text-center leading-relaxed">
            <p>
              Legal Aid Hub was founded in 2024 to bridge the justice gap in India. With over 70% of Indians having no access to legal services, we're leveraging technology to make quality legal help available to everyone — from metro cities to rural areas.
            </p>
            <p>
              Our platform connects individuals, small businesses, and organizations with Bar Council verified advocates across all 28 states and 8 union territories. We handle cases under Indian Penal Code (IPC), Civil Procedure Code (CPC), family matters, consumer disputes, GST issues, labour laws, and more.
            </p>
            <p>
              Built by legal professionals and technologists who understand India's unique legal landscape, we're committed to making the Indian justice system more accessible, affordable, and efficient.
            </p>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4 py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
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
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Contact</p>
          <h2 className="text-3xl font-bold md:text-4xl">Get In Touch</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {[
            { icon: Mail, title: "Email", info: "support@legalaidhub.in", sub: "We respond within 24 hours" },
            { icon: Phone, title: "Phone", info: "+91 9876543210", sub: "Mon-Sat 9AM-7PM IST" },
            { icon: MessageCircle, title: "WhatsApp", info: "+91 9876543210", sub: "WhatsApp support available" },
            { icon: MapPin, title: "Office", info: "Registered Office", sub: "New Delhi, India" },
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
              <p className="text-xs text-muted-foreground">All advocates verified by Bar Council of India.</p>
              <div className="flex gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Twitter className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Linkedin className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Facebook className="h-4 w-4" /></Button>
              </div>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "For Advocates", "For Clients"] },
              { title: "Company", links: ["About Us", "Careers", "Blog", "Press"] },
              { title: "Legal", links: ["Terms of Service", "Privacy Policy", "Cookie Policy", "DPDP Compliance"] },
              { title: "Support", links: ["Help Center", "Contact Us", "WhatsApp Support", "Status"] },
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
          <div className="mt-10 border-t border-border pt-6 text-center space-y-1">
            <p className="text-xs text-muted-foreground">© 2024 Legal Aid Hub. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">Governed by laws of India · Registered under Companies Act, 2013</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Platform Demo</DialogTitle>
            <DialogDescription>See how Legal Aid Hub works in under 2 minutes.</DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-3">
              <Play className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Demo video coming soon</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDemoOpen(false)}>Close</Button>
            <Link to="/login">
              <Button>Get Started Now</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
