import type { ReviewSort, StayDetail } from "@deskaway/shared";
import { useId, useState } from "react";
import { Button } from "../../components/Button";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";
import { ReviewSummary } from "./ReviewSummary";

export function Reviews({ stay }: { stay: StayDetail }) {
  const headingId = useId();
  const [sort, setSort] = useState<ReviewSort>("recent");
  const [formOpen, setFormOpen] = useState(false);
  const [newReviewId, setNewReviewId] = useState<string>();
  const [announcement, setAnnouncement] = useState("");

  return (
    <section
      id="reviews"
      aria-labelledby={headingId}
      className="flex flex-col gap-6"
    >
      <ReviewSummary summary={stay.reviewSummary} headingId={headingId} />

      {stay.reviewSummary.count > 0 && (
        <ReviewList
          stayId={stay.id}
          sort={sort}
          onSortChange={(next) => {
            setSort(next);
            // Once the guest picks a sort, the new review takes its normal place.
            setNewReviewId(undefined);
          }}
          newReviewId={newReviewId}
        />
      )}

      <div>
        <Button
          variant="secondary"
          onClick={() => {
            setAnnouncement("");
            setFormOpen(true);
          }}
        >
          Write a review
        </Button>
      </div>

      <ReviewForm
        stayId={stay.id}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
        }}
        onAdded={(review) => {
          setFormOpen(false);
          setNewReviewId(review.id);
          setAnnouncement("Review added");
        }}
      />

      {/* Always rendered, so screen readers pick up the change. */}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
