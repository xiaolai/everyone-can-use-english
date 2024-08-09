import { useEffect, useState, useRef, useCallback } from "react";
import { renderPitchContour } from "@renderer/lib/utils";
import { extractFrequencies } from "@/utils";
import WaveSurfer from "wavesurfer.js";
import { Button, Skeleton } from "@renderer/components/ui";
import { PlayIcon, PauseIcon } from "lucide-react";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { secondsToTimestamp } from "@renderer/lib/utils";

export const SpeechPlayer = (props: {
  speech: Partial<SpeechType>;
  height?: number;
}) => {
  const { speech, height = 100 } = props;
  const [isPlaying, setIsPlaying] = useState(false);
  const [wavesurfer, setWavesurfer] = useState(null);
  const containerRef = useRef();
  const [ref, entry] = useIntersectionObserver({
    threshold: 1,
  });
  const [duration, setDuration] = useState<number>(0);
  const [initialized, setInitialized] = useState(false);

  const onPlayClick = useCallback(() => {
    wavesurfer.playPause();
  }, [wavesurfer]);

  useEffect(() => {
    // use the intersection observer to only create the wavesurfer instance
    // when the player is visible
    if (!entry?.isIntersecting) return;
    if (!speech?.src) return;
    if (wavesurfer) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      url: speech.src,
      height,
      barWidth: 1,
      cursorWidth: 0,
      autoCenter: false,
      autoScroll: true,
      hideScrollbar: true,
      minPxPerSec: 100,
      waveColor: "#ddd",
      progressColor: "rgba(0, 0, 0, 0.25)",
      normalize: true,
    });

    setWavesurfer(ws);
  }, [speech, entry]);

  useEffect(() => {
    if (!wavesurfer) return;

    const subscriptions = [
      wavesurfer.on("play", () => {
        setIsPlaying(true);
      }),
      wavesurfer.on("pause", () => {
        setIsPlaying(false);
      }),
      wavesurfer.on("ready", () => {
        setDuration(wavesurfer.getDuration());
        const peaks = wavesurfer.getDecodedData().getChannelData(0);
        const sampleRate = wavesurfer.options.sampleRate;
        const data = extractFrequencies({ peaks, sampleRate });
        setTimeout(() => {
          renderPitchContour({
            wrapper: wavesurfer.getWrapper(),
            canvasId: `pitch-contour-${speech.id}-canvas`,
            labels: new Array(data.length).fill(""),
            datasets: [
              {
                data,
                cubicInterpolationMode: "monotone",
                pointRadius: 1,
              },
            ],
          });
        }, 1000);
        setInitialized(true);
      }),
    ];

    return () => {
      subscriptions.forEach((unsub) => unsub());
      wavesurfer?.destroy();
    };
  }, [wavesurfer]);

  return (
    <div className="w-full">
      <div className="flex justify-end">
        <span className="text-xs text-muted-foreground mb-1">
          {secondsToTimestamp(duration)}
        </span>
      </div>
      <div
        ref={ref}
        className="bg-background rounded-lg grid grid-cols-9 items-center relative pl-2 h-[100px]"
      >
        {!initialized && (
          <div className="col-span-9 flex flex-col justify-around h-[80px]">
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        )}

        <div className={`flex justify-center ${initialized ? "" : "hidden"}`}>
          <Button
            onClick={onPlayClick}
            className="aspect-square rounded-full p-2 w-full max-w-[50%] h-auto bg-blue-600 hover:bg-blue-500"
          >
            {isPlaying ? (
              <PauseIcon className="w-6 h-6 text-white" />
            ) : (
              <PlayIcon className="w-6 h-6 text-white" />
            )}
          </Button>
        </div>

        <div
          data-testid="wavesurfer-container"
          className={`col-span-8 ${initialized ? "" : "hidden"}`}
          ref={containerRef}
        ></div>
      </div>
    </div>
  );
};
