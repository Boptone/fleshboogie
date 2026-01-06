import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        setEmail("");
      } else {
        toast.error(data.message);
      }
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error("Failed to subscribe. Please try again.");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Detect user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    subscribeMutation.mutate({
      email,
      timezone,
    });
  };

  return (
    <section id="newsletter" className="mt-12 pt-8 border-t-2 border-foreground">
      <div className="max-w-2xl">
        <h3 className="text-2xl font-black uppercase mb-2 tracking-tight">
          THE BOOGIE BLAST
        </h3>
        <p className="text-sm mb-4">
          Get the best links delivered to your inbox every morning at 9am (your local time). No spam, unsubscribe anytime.
        </p>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-background border-2 border-foreground text-foreground placeholder:text-muted-foreground font-mono"
            required
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-foreground text-background hover:bg-muted font-bold uppercase tracking-wide"
          >
            {isSubmitting ? "..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
}
