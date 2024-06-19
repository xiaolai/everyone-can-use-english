import { useEffect, useContext, useRef, useState } from "react";
import {
  AppSettingsProviderContext,
  DbProviderContext,
  MediaPlayerProviderContext,
} from "@renderer/context";
import { t } from "i18next";
import {
  Button,
  PingPoint,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@renderer/components/ui";
import {
  LoaderIcon,
  CheckCircleIcon,
  MicIcon,
  PencilLineIcon,
  SquareMenuIcon,
} from "lucide-react";
import { AlignmentResult } from "echogarden/dist/api/API.d.js";
import { formatDuration } from "@renderer/lib/utils";
import {
  MediaTranscriptionForm,
  MediaTranscriptionReadButton,
  MediaTranscriptionGenerateButton,
} from "@renderer/components";

export const MediaTranscription = () => {
  const containerRef = useRef<HTMLDivElement>();
  const {
    decoded,
    media,
    currentSegmentIndex,
    wavesurfer,
    setCurrentSegmentIndex,
    transcription,
    transcribing,
    transcribingProgress,
  } = useContext(MediaPlayerProviderContext);
  const { EnjoyApp } = useContext(AppSettingsProviderContext);
  const { addDblistener, removeDbListener } = useContext(DbProviderContext);

  const [recordingStats, setRecordingStats] =
    useState<SegementRecordingStatsType>([]);

  const [notesStats, setNotesStats] = useState<
    {
      targetId: string;
      targetType: string;
      count: number;
      segment: SegmentType;
    }[]
  >([]);

  const fetchSegmentStats = async () => {
    if (!media) return;

    EnjoyApp.recordings
      .groupBySegment(media.id, media.mediaType)
      .then((stats) => {
        setRecordingStats(stats);
      });

    EnjoyApp.notes.groupBySegment(media.id, media.mediaType).then((stats) => {
      setNotesStats(stats);
    });
  };

  useEffect(() => {
    if (!transcription?.result) return;

    addDblistener(fetchSegmentStats);
    fetchSegmentStats();

    return () => {
      removeDbListener(fetchSegmentStats);
    };
  }, [transcription?.result]);

  useEffect(() => {
    if (!containerRef?.current) return;
    if (!decoded) return;

    setTimeout(() => {
      containerRef.current
        ?.querySelector(`#segment-${currentSegmentIndex}`)
        ?.scrollIntoView({
          block: "center",
          inline: "center",
        } as ScrollIntoViewOptions);
    }, 300);
  }, [decoded, currentSegmentIndex, transcription, containerRef]);

  if (!transcription?.result?.timeline) {
    return null;
  }

  return (
    <div ref={containerRef} data-testid="media-transcription-result">
      <div className="px-4 py-1 bg-background">
        <div className="flex items-cener justify-between">
          <div className="flex items-center space-x-2">
            {transcribing || transcription.state === "processing" ? (
              <>
                <PingPoint colorClassName="bg-yellow-500" />
                <div className="text-sm">
                  {transcribingProgress > 0 && `${transcribingProgress}%`}
                </div>
              </>
            ) : transcription.state === "finished" ? (
              <CheckCircleIcon className="text-green-500 w-4 h-4" />
            ) : (
              <PingPoint colorClassName="bg-mute" />
            )}
            <span className="capitalize">{t("transcript")}</span>
          </div>
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <SquareMenuIcon className="w-5 h-5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-36">
                <DropdownMenuItem asChild>
                  <MediaTranscriptionReadButton>
                    <Button variant="ghost" className="block w-full">
                      {t("readThrough")}
                    </Button>
                  </MediaTranscriptionReadButton>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <MediaTranscriptionGenerateButton>
                    <Button
                      variant="ghost"
                      className="w-full"
                      disabled={transcribing}
                    >
                      {(!transcribing ||
                        transcription.state === "processing") && (
                        <LoaderIcon className="animate-spin w-4 mr-2" />
                      )}
                      <span>
                        {transcription.result
                          ? t("regenerate")
                          : t("transcribe")}
                      </span>
                    </Button>
                  </MediaTranscriptionGenerateButton>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <MediaTranscriptionForm>
                    <Button variant="ghost" className="block w-full">
                      {t("edit")}
                    </Button>
                  </MediaTranscriptionForm>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {(transcription.result as AlignmentResult).timeline.map(
        (sentence, index) => (
          <div
            key={index}
            id={`segment-${index}`}
            className={`py-2 px-4 cursor-pointer hover:bg-yellow-400/10 ${
              currentSegmentIndex === index ? "bg-yellow-400/25" : ""
            }`}
            onClick={() => {
              const duration = wavesurfer.getDuration();
              wavesurfer.seekTo(
                Math.floor((sentence.startTime / duration) * 1e8) / 1e8
              );
              wavesurfer.setScrollTime(sentence.startTime);
              setCurrentSegmentIndex(index);
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-50">#{index + 1}</span>
              <div className="flex items-center space-x-2">
                {(recordingStats || []).findIndex(
                  (s) => s.referenceId === index
                ) !== -1 && <MicIcon className="w-3 h-3 text-sky-500" />}
                {(notesStats || []).findIndex(
                  (s) => s.segment?.segmentIndex === index
                ) !== -1 && <PencilLineIcon className="w-3 h-3 text-sky-500" />}
                <span className="text-xs opacity-50">
                  {formatDuration(sentence.startTime, "s")}
                </span>
              </div>
            </div>
            <p className="">{sentence.text}</p>
          </div>
        )
      )}
    </div>
  );
};
