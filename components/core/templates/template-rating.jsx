import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

const TemplateRating = ({
  templateId,
  initialRating = 0,
  initialCount = 0,
  onRatingSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  const handleRatingSubmit = async () => {
    try {
      await onRatingSubmit(templateId, rating);
      setHasRated(true);
      toast.success('Rating submitted successfully');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            disabled={hasRated}
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none"
          >
            <Star
              size={20}
              className={`transition-colors ${
                (hoveredRating ? value <= hoveredRating : value <= rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : value <= initialRating
                    ? 'fill-gray-300 text-gray-300'
                    : 'fill-none text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-500">
        {initialRating.toFixed(1)} ({initialCount} ratings)
      </div>

      {!hasRated && rating > 0 && (
        <Button
          onClick={handleRatingSubmit}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          Submit Rating
        </Button>
      )}
    </div>
  );
};

export default TemplateRating;
