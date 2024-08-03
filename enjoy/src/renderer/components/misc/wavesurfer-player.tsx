import {
  cn,
  renderPitchContour,
  secondsToTimestamp,
} from "@renderer/lib/utils";
import { extractFrequencies } from "@/utils";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Button, Skeleton } from "@renderer/components/ui";
import { PauseIcon, PlayIcon, XCircleIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { t } from "i18next";

export const WavesurferPlayer = (props: {
  id: string;
  src: string;
  height?: number;
  currentTime?: number;
  setCurrentTime?: (currentTime: number) => void;
  onError?: (error: Error) => void;
  wavesurferOptions?: any;
  pitchContourOptions?: any;
  className?: string;
}) => {
  const {
    id,
    src,
    height = 80,
    onError,
    setCurrentTime,
    wavesurferOptions,
    pitchContourOptions,
    className = "",
  } = props;
  const [initialized, setInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wavesurfer, setWavesurfer] = useState(null);
  const containerRef = useRef();
  const [ref, entry] = useIntersectionObserver({
    threshold: 1,
  });
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string>(null);

  const onPlayClick = useCallback(() => {
    if (!wavesurfer) return;

    wavesurfer.playPause();
  }, [wavesurfer]);

  const initialize = () => {
    if (!containerRef.current) return;
    if (!src) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      url: src,
      height,
      barWidth: 1,
      cursorWidth: 0,
      autoCenter: true,
      autoScroll: true,
      dragToSeek: true,
      hideScrollbar: true,
      minPxPerSec: 100,
      waveColor: "#ddd",
      progressColor: "rgba(0, 0, 0, 0.25)",
      ...wavesurferOptions,
    });

    setWavesurfer(ws);
  };

  useEffect(() => {
    if (!entry?.isIntersecting) return;
    if (wavesurfer?.options?.url === src) return;

    initialize();
  }, [src, entry, containerRef]);

  useEffect(() => {
    if (!wavesurfer) return;

    const uuid = uuidv4();
    const subscriptions = [
      wavesurfer.on("play", () => {
        setIsPlaying(true);
        const customEvent = new CustomEvent("play", { detail: { uuid } });
        document.dispatchEvent(customEvent);
      }),
      wavesurfer.on("pause", () => {
        setIsPlaying(false);
      }),
      wavesurfer.on("timeupdate", (time: number) => {
        setCurrentTime && setCurrentTime(time);
      }),
      wavesurfer.on("ready", () => {
        setDuration(wavesurfer.getDuration());
        const peaks = wavesurfer.getDecodedData().getChannelData(0);
        const sampleRate = wavesurfer.options.sampleRate;
        const data = extractFrequencies({ peaks, sampleRate });
        setTimeout(() => {
          renderPitchContour({
            wrapper: wavesurfer.getWrapper(),
            canvasId: `pitch-contour-${id}-canvas`,
            labels: new Array(data.length).fill(""),
            datasets: [
              {
                data,
                cubicInterpolationMode: "monotone",
                pointRadius: 1,
                ...pitchContourOptions,
              },
            ],
          });
        }, 1000);
        setInitialized(true);
      }),
      wavesurfer.on("error", (err: Error) => {
        setError(err.message);
        onError(err);
      }),
    ];

    const onOtherPlayerPlay = (event: CustomEvent) => {
      if (!wavesurfer) return;
      if (event.detail.uuid === uuid) return;

      wavesurfer.pause();
    };

    document.addEventListener("play", onOtherPlayerPlay);

    return () => {
      subscriptions.forEach((unsub) => unsub());
      wavesurfer?.destroy();
      document.removeEventListener("play", onOtherPlayerPlay);
    };
  }, [wavesurfer]);

  if (error) {
    return (
      <div
        className={cn("w-full bg-background rounded-lg p-4 border", className)}
      >
        <div className="flex items-center justify-center mb-2">
          <XCircleIcon className="w-4 h-4 text-destructive" />
        </div>
        <div className="select-text break-all text-center text-sm text-muted-foreground mb-4">
          {error}
        </div>
        <div className="flex items-center justify-center">
          <Button onClick={() => setError(null)}>{t("retry")}</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <span className="text-xs text-muted-foreground">
          {secondsToTimestamp(duration)}
        </span>
      </div>

      <div
        ref={ref}
        className={cn(
          "bg-background rounded-lg grid grid-cols-9 items-center relative h-[80px]",
          className
        )}
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
          className={`col-span-8 ${initialized ? "" : "hidden"}`}
          ref={containerRef}
        ></div>
      </div>
    </>
  );
};
