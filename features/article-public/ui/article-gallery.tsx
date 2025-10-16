/**
 * Article Gallery Component
 * Displays article images and videos with navigation
 */

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ArticleGalleryProps {
  images: string[];
  videos: string[];
  selectedIndex: number;
  onSelectImage: (index: number) => void;
}

export function ArticleGallery({
  images,
  videos,
  selectedIndex,
  onSelectImage,
}: ArticleGalleryProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Combine images and videos for display
  const mediaItems = [...images, ...videos];
  const currentItem = mediaItems[selectedIndex];

  const isVideo = currentItem && videos.includes(currentItem);
  const isLastItem = selectedIndex === mediaItems.length - 1;
  const isFirstItem = selectedIndex === 0;

  const handlePrevious = () => {
    if (!isFirstItem) {
      onSelectImage(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (!isLastItem) {
      onSelectImage(selectedIndex + 1);
    }
  };

  return (
    <div className="relative">
      {/* Main Media Display */}
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
        {isVideo ? (
          <video
            src={currentItem}
            className="w-full h-full object-cover"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            poster={images[0]} // Use first image as poster
          />
        ) : (
          <img
            src={currentItem}
            alt={`Article media ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
          />
        )}

        {/* Navigation Arrows */}
        {!isFirstItem && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {!isLastItem && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Media Type Indicator */}
        <div className="absolute top-2 right-2">
          {isVideo ? (
            <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Play className="h-3 w-3" />
              Vidéo
            </div>
          ) : (
            <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
              {selectedIndex + 1} / {mediaItems.length}
            </div>
          )}
        </div>
      </div>

      {/* Media Counter */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {selectedIndex + 1} / {mediaItems.length}
      </div>
    </div>
  );
}
