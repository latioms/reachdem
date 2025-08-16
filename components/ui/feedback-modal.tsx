"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackModal() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast.error("Veuillez écrire un commentaire");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/send-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          feedback: feedback.trim(),
        }),
      });

      if (response.ok) {
        toast.success("Merci pour votre feedback ! 🎉");
        setFeedback("");
        setRating(0);
      } else {
        toast.error("Erreur lors de l'envoi du feedback");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Erreur lors de l'envoi du feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Donnez-nous votre avis</DialogTitle>
          <DialogDescription>
            Décrivez-nous comment nous pouvons améliorer notre application. 
            Vous rencontrez une erreur ou un problème ? Faites-le nous savoir ! 
            Votre feedback nous aide à créer une meilleure expérience. 🚀
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Notez votre expérience (1-10)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating}/10
                </span>
              )}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              Votre commentaire
            </label>
            <Textarea
              id="feedback"
              placeholder="Partagez vos idées, signalez des bugs, ou suggérez des améliorations..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || !feedback.trim()}
              className="gap-2"
            >
              {isSubmitting ? "Envoi..." : "Envoyer le feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
