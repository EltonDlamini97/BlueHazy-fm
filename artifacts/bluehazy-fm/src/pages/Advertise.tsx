import { useSubmitContact } from "@workspace/api-client-react";
import { BarChart, Users, Zap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const adSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company is required"),
  budget: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Advertise() {
  const { toast } = useToast();
  const submitContact = useSubmitContact();
  
  const form = useForm<z.infer<typeof adSchema>>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      budget: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof adSchema>) {
    submitContact.mutate({
      data: {
        name: values.name,
        email: values.email,
        subject: `Advertising Inquiry from ${values.company}`,
        message: `Budget: ${values.budget}\n\n${values.message}`,
        inquiryType: "advertising"
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Inquiry sent!",
          description: "Our partnership team will contact you shortly.",
        });
        form.reset();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong. Please try again later.",
        });
      }
    });
  }

  return (
    <div className="pt-8 pb-24">
      {/* Hero */}
      <section className="relative py-20 mb-16 rounded-3xl overflow-hidden glass border-white/10 mx-4">
        <div className="absolute inset-0 bg-primary/10 mix-blend-screen" />
        <div className="container relative z-10 px-8 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black mb-6">Amplify Your <span className="text-primary text-glow">Brand</span></h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8">
            Connect with our highly engaged, dynamic audience. We offer bespoke advertising solutions, event sponsorships, and integrated campaigns.
          </p>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 box-glow h-14 text-lg font-bold">
            <Download className="w-5 h-5 mr-2" /> Download Media Kit
          </Button>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Stats */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-2xl border-white/10 text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-4xl font-black text-white mb-2">1.2M+</div>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Monthly Listeners</p>
            </div>
            <div className="glass p-8 rounded-2xl border-white/10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/10" />
              <BarChart className="w-12 h-12 text-primary mx-auto mb-4 relative z-10" />
              <div className="text-4xl font-black text-white mb-2 relative z-10">4.8M</div>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm relative z-10">Social Impressions</p>
            </div>
            <div className="glass p-8 rounded-2xl border-white/10 text-center">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-4xl font-black text-white mb-2">18-35</div>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Core Demographic</p>
            </div>
          </div>
        </section>

        {/* Packages & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-3xl font-black text-white mb-8">Partnership Opportunities</h2>
            
            <div className="space-y-6">
              <div className="glass p-6 rounded-xl border-l-4 border-primary">
                <h3 className="text-xl font-bold text-white mb-2">On-Air Sponsorship</h3>
                <p className="text-muted-foreground">Sponsor specific shows with dedicated live reads, branded segments, and audio commercials during peak listening hours.</p>
              </div>
              <div className="glass p-6 rounded-xl border-l-4 border-white/20 hover:border-primary transition-colors">
                <h3 className="text-xl font-bold text-white mb-2">Digital Integration</h3>
                <p className="text-muted-foreground">Banner ads on our website, featured newsletter placements, and social media cross-promotion to our engaged followers.</p>
              </div>
              <div className="glass p-6 rounded-xl border-l-4 border-white/20 hover:border-primary transition-colors">
                <h3 className="text-xl font-bold text-white mb-2">Event Activation</h3>
                <p className="text-muted-foreground">Physical brand presence at our live events, studio sessions, and community gatherings. VIP experiences available.</p>
              </div>
            </div>
          </div>

          <div className="glass p-8 md:p-10 rounded-2xl border-white/10">
            <h3 className="text-2xl font-bold text-white mb-2">Request a Quote</h3>
            <p className="text-muted-foreground mb-8">Tell us about your brand and goals.</p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} className="bg-black/50 border-white/10 focus-visible:ring-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Work Email</FormLabel>
                        <FormControl>
                          <Input placeholder="jane@company.com" type="email" {...field} className="bg-black/50 border-white/10 focus-visible:ring-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corp" {...field} className="bg-black/50 border-white/10 focus-visible:ring-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Estimated Budget</FormLabel>
                        <FormControl>
                          <Input placeholder="$5k - $10k" {...field} className="bg-black/50 border-white/10 focus-visible:ring-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel className="text-muted-foreground">Campaign Goals</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What are you looking to achieve?" 
                          className="min-h-[120px] bg-black/50 border-white/10 focus-visible:ring-primary resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground box-glow"
                  disabled={submitContact.isPending}
                >
                  {submitContact.isPending ? "Submitting..." : "Submit Inquiry"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
