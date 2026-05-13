import { useSubmitContact } from "@workspace/api-client-react";
import { SiFacebook, SiTiktok, SiInstagram, SiWhatsapp, SiYoutube, SiX } from "react-icons/si";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  phone: z.string().optional(),
});

export default function Contact() {
  const { toast } = useToast();
  const submitContact = useSubmitContact();
  
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      phone: "",
    },
  });

  function onSubmit(values: z.infer<typeof contactSchema>) {
    submitContact.mutate({
      data: {
        ...values,
        inquiryType: "general"
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Message sent!",
          description: "We'll get back to you as soon as possible.",
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
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Get in <span className="text-primary text-glow">Touch</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Have a question, shoutout, or business inquiry? We want to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass p-8 rounded-2xl border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <RadioIcon className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">Contact Info</h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Studio Address</h4>
                    <p className="text-muted-foreground text-sm">123 Broadcast Ave, Neon District<br/>Cyber City, CC 90210</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Email Us</h4>
                    <p className="text-muted-foreground text-sm">hello@bluehazy.fm<br/>studio@bluehazy.fm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
                    <SiWhatsapp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Studio WhatsApp</h4>
                    <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
                    <a href="#" className="text-xs font-bold text-[#25D366] hover:underline mt-1 inline-block">Message the DJ directly &rarr;</a>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10">
                <h4 className="font-bold text-white mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary text-white flex items-center justify-center transition-colors"><SiInstagram className="w-4 h-4" /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary text-white flex items-center justify-center transition-colors"><SiX className="w-4 h-4" /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary text-white flex items-center justify-center transition-colors"><SiTiktok className="w-4 h-4" /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary text-white flex items-center justify-center transition-colors"><SiYoutube className="w-4 h-4" /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary text-white flex items-center justify-center transition-colors"><SiFacebook className="w-4 h-4" /></a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="glass p-8 md:p-10 rounded-2xl border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="bg-black/50 border-white/10 focus-visible:ring-primary" />
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
                          <FormLabel className="text-muted-foreground">Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" type="email" {...field} className="bg-black/50 border-white/10 focus-visible:ring-primary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 234 567 8900" {...field} className="bg-black/50 border-white/10 focus-visible:ring-primary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Song request, feedback, etc." {...field} className="bg-black/50 border-white/10 focus-visible:ring-primary" />
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
                        <FormLabel className="text-muted-foreground">Your Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your message here..." 
                            className="min-h-[150px] bg-black/50 border-white/10 focus-visible:ring-primary resize-none"
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
                    {submitContact.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RadioIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
      <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
    </svg>
  );
}
