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
import { toast } from "sonner";
import { MessageSquare, Star } from "lucide-react";

export default function FeedbackDialog() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast.error("Veuillez saisir votre feedback");
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
          feedback: feedback.trim(),
          rating,
        }),
      });

      if (response.ok) {
        toast.success("Merci pour votre feedback ! Un email de confirmation vous a été envoyé.");
        setFeedback("");
        setRating(0);
        setIsOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Erreur lors de l'envoi du feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1 justify-center my-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="button"
            className={`p-1 transition-colors hover:scale-110 transform duration-150 ${
              star <= (hoveredRating || rating)
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          >
            <Star
              size={20}
              fill={star <= (hoveredRating || rating) ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <MessageSquare size={16} />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare size={20} />
            Donnez-nous votre avis
          </DialogTitle>
          <DialogDescription>
            Décrivez-nous comment nous pouvons améliorer notre application.
            Vous rencontrez une erreur ou un problème ? 
            <span className="block mt-2 text-primary">
              Votre retour nous aide à créer une meilleure expérience ! 🚀
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Notez notre application (facultatif)
            </label>
            {renderStars()}
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating}/10 - {
                  rating <= 3 ? "Peut mieux faire 😅" :
                  rating <= 6 ? "Pas mal ! 👍" :
                  rating <= 8 ? "Très bien ! 😊" :
                  "Excellent ! 🎉"
                }
              </p>
            )}
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              Votre feedback *
            </label>
            <Textarea
              id="feedback"
              placeholder="Que pensez-vous de ReachDem ? Avez-vous des suggestions d'amélioration ? Rencontrez-vous des problèmes ? Dites-nous tout !"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] resize-none"
              aria-label="Envoyer un feedback"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !feedback.trim()}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Envoi..." : "Envoyer feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
