import { createContext, useEffect, useState, useContext } from "react";
import { convertIpaToNormal, extractFrequencies } from "@/utils";
import { AppSettingsProviderContext } from "@renderer/context";
import {
  useTranscriptions,
  useRecordings,
  useSegments,
  useNotes,
} from "@renderer/hooks";
import WaveSurfer from "wavesurfer.js";
import Regions, {
  type Region as RegionType,
} from "wavesurfer.js/dist/plugins/regions";
import Chart from "chart.js/auto";
import { TimelineEntry } from "echogarden/dist/utilities/Timeline.d.js";
import { toast } from "@renderer/components/ui";
import { Tooltip } from "react-tooltip";
import { debounce } from "lodash";

type MediaPlayerContextType = {
  layout: {
    name: string;
    width: number;
    height: number;
    wrapper: string;
    upperWrapper: string;
    lowerWrapper: string;
    playerWrapper: string;
    panelWrapper: string;
    playerHeight: number;
  };
  media: AudioType | VideoType;
  setMedia: (media: AudioType | VideoType) => void;
  setMediaProvider: (mediaProvider: HTMLAudioElement | null) => void;
  waveform: WaveFormDataType;
  // wavesurfer
  wavesurfer: WaveSurfer;
  setRef: (ref: any) => void;
  decoded: boolean;
  decodeError: string;
  setDecodeError: (error: string) => void;
  // player state
  currentTime: number;
  currentSegmentIndex: number;
  setCurrentSegmentIndex: (index: number) => void;
  zoomRatio: number;
  setZoomRatio: (zoomRation: number) => void;
  fitZoomRatio: number;
  minPxPerSec: number;
  // regions
  regions: Regions | null;
  activeRegion: RegionType;
  setActiveRegion: (region: RegionType) => void;
  editingRegion: boolean;
  setEditingRegion: (editing: boolean) => void;
  renderPitchContour: (
    region: RegionType,
    options?: {
      repaint?: boolean;
      canvasId?: string;
      containerClassNames?: string[];
      data?: Chart["data"];
    }
  ) => void;
  pitchChart: Chart;
  // Transcription
  transcription: TranscriptionType;
  generateTranscription: (params?: {
    originalText?: string;
    language?: string;
    service?: WhisperConfigType["service"];
  }) => Promise<void>;
  transcribing: boolean;
  transcribingProgress: number;
  transcribingOutput: string;
  transcriptionDraft: TranscriptionType["result"];
  setTranscriptionDraft: (result: TranscriptionType["result"]) => void;
  // Recordings
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  currentRecording: RecordingType;
  setCurrentRecording: (recording: RecordingType) => void;
  recordings: RecordingType[];
  fetchRecordings: (offset: number) => void;
  loadingRecordings: boolean;
  hasMoreRecordings: boolean;
  // Notes
  currentNotes: NoteType[];
  createNote: (params: any) => void;
  // Segments
  currentSegment: SegmentType;
  createSegment: () => Promise<SegmentType | void>;
  getCachedSegmentIndex: () => Promise<number>;
  setCachedSegmentIndex: (index: number) => void;
};

export const MediaPlayerProviderContext =
  createContext<MediaPlayerContextType>(null);

const LAYOUT = {
  sm: {
    name: "sm",
    wrapper: "h-[calc(100vh-3.5rem)]",
    upperWrapper: "h-[calc(100vh-27.5rem)] min-h-64",
    lowerWrapper: "h-[23rem]",
    playerWrapper: "h-[9rem] mb-2",
    panelWrapper: "h-16 w-full z-10 sticky bottom-0",
    playerHeight: 128,
  },
  lg: {
    name: "lg",
    wrapper: "h-[calc(100vh-3.5rem)]",
    upperWrapper: "h-[calc(100vh-37.5rem)]",
    lowerWrapper: "h-[33rem]",
    panelWrapper: "h-20 w-full z-10 sticky bottom-0",
    playerWrapper: "h-[13rem] mb-4",
    playerHeight: 192,
  },
};

export const MediaPlayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const minPxPerSec = 150;
  const { EnjoyApp, webApi, learningLanguage } = useContext(
    AppSettingsProviderContext
  );

  const [layout, setLayout] = useState<{
    name: string;
    width: number;
    height: number;
    wrapper: string;
    upperWrapper: string;
    lowerWrapper: string;
    playerWrapper: string;
    panelWrapper: string;
    playerHeight: number;
  }>();

  const [media, setMedia] = useState<AudioType | VideoType>(null);
  const [mediaProvider, setMediaProvider] = useState<HTMLAudioElement | null>(
    null
  );
  const [waveform, setWaveForm] = useState<WaveFormDataType>(null);
  const [wavesurfer, setWavesurfer] = useState(null);

  const [regions, setRegions] = useState<Regions | null>(null);
  const [activeRegion, setActiveRegion] = useState<RegionType>(null);
  const [editingRegion, setEditingRegion] = useState<boolean>(false);
  const [pitchChart, setPitchChart] = useState<Chart>(null);

  const [ref, setRef] = useState(null);

  // Player state
  const [decoded, setDecoded] = useState<boolean>(false);
  const [decodeError, setDecodeError] = useState<string>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [fitZoomRatio, setFitZoomRatio] = useState<number>(1.0);
  const [zoomRatio, setZoomRatio] = useState<number>(1.0);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentRecording, setCurrentRecording] = useState<RecordingType>(null);

  const [transcriptionDraft, setTranscriptionDraft] =
    useState<TranscriptionType["result"]>();

  const {
    transcription,
    generateTranscription,
    transcribing,
    transcribingProgress,
    transcribingOutput,
    abortGenerateTranscription,
  } = useTranscriptions(media);

  const {
    recordings,
    fetchRecordings,
    loading: loadingRecordings,
    hasMore: hasMoreRecordings,
  } = useRecordings(media, currentSegmentIndex);

  const { segment, createSegment } = useSegments({
    targetId: media?.id,
    targetType: media?.mediaType,
    segmentIndex: currentSegmentIndex,
  });

  const getCachedSegmentIndex = async () => {
    if (!media) return;

    const index = await EnjoyApp.cacheObjects.get(
      `${media.mediaType.toLowerCase()}-${media.id}-last-segment-index`
    );

    return index || 0;
  };

  const setCachedSegmentIndex = (index: number) => {
    if (!media) return;

    return EnjoyApp.cacheObjects.set(
      `${media.mediaType.toLowerCase()}-${media.id}-last-segment-index`,
      index
    );
  };

  const { notes, createNote } = useNotes({
    targetId: segment?.id,
    targetType: "Segment",
  });

  const initializeWavesurfer = async () => {
    if (!layout?.playerHeight) return;
    if (!media) return;
    if (!mediaProvider) return;
    if (!ref?.current) return;

    const ws = WaveSurfer.create({
      container: ref.current,
      height: layout.playerHeight,
      waveColor: "#eaeaea",
      progressColor: "#c0d6df",
      cursorColor: "#ff0054",
      barWidth: 2,
      autoScroll: true,
      minPxPerSec,
      autoCenter: false,
      dragToSeek: false,
      fillParent: true,
      media: mediaProvider,
      peaks: waveform ? [waveform.peaks] : undefined,
      duration: waveform ? waveform.duration : undefined,
    });

    const blob = await fetch(media.src).then((res) => res.blob());

    if (waveform) {
      ws.loadBlob(blob, [waveform.peaks], waveform.duration);
      setDecoded(true);
    } else {
      ws.loadBlob(blob);
    }

    setWavesurfer(ws);
  };

  const renderPitchContour = (
    region: RegionType,
    options?: {
      repaint?: boolean;
      canvasId?: string;
      containerClassNames?: string[];
      data?: Chart["data"];
    }
  ) => {
    if (!region) return;
    if (!waveform?.frequencies?.length) return;
    if (!wavesurfer) return;

    const { repaint = true, containerClassNames = [] } = options || {};
    const duration = wavesurfer.getDuration();
    const fromIndex = Math.round(
      (region.start / duration) * waveform.frequencies.length
    );
    const toIndex = Math.round(
      (region.end / duration) * waveform.frequencies.length
    );

    const wrapper = (wavesurfer as any).renderer.getWrapper();
    // remove existing pitch contour
    if (repaint) {
      wrapper
        .querySelectorAll(".pitch-contour")
        .forEach((element: HTMLDivElement) => {
          element.remove();
        });
    }

    // calculate offset and width
    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const offsetLeft = (region.start / duration) * wrapperWidth;
    const width = ((region.end - region.start) / duration) * wrapperWidth;

    // create container and canvas
    const pitchContourWidthContainer = document.createElement("div");
    const canvas = document.createElement("canvas");
    const canvasId = options?.canvasId || `pitch-contour-${region.id}-canvas`;
    canvas.id = canvasId;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${layout.playerHeight}px`;
    pitchContourWidthContainer.appendChild(canvas);

    pitchContourWidthContainer.style.position = "absolute";
    pitchContourWidthContainer.style.top = "0";
    pitchContourWidthContainer.style.left = "0";

    pitchContourWidthContainer.style.width = `${width}px`;
    pitchContourWidthContainer.style.height = `${layout.playerHeight}px`;
    pitchContourWidthContainer.style.marginLeft = `${offsetLeft}px`;
    pitchContourWidthContainer.classList.add(
      "pitch-contour",
      ...containerClassNames
    );
    // pitchContourWidthContainer.style.zIndex = "3";

    wrapper.appendChild(pitchContourWidthContainer);

    // prepare chart data
    let chartData: Chart["data"] = options?.data;

    if (!chartData) {
      const data = waveform.frequencies.slice(fromIndex, toIndex);
      const regionDuration = region.end - region.start;

      const labels = new Array(data.length).fill("");
      const caption = transcription?.result?.timeline?.[currentSegmentIndex];
      if (region.id.startsWith("segment-region")) {
        caption.timeline.forEach((segment: TimelineEntry) => {
          const index = Math.round(
            ((segment.startTime - region.start) / regionDuration) * data.length
          );
          labels[index] = segment.text.trim();
        });
      } else if (region.id.startsWith("meaning-group-region")) {
        const words = caption.timeline.filter(
          (w: TimelineEntry) =>
            w.startTime >= region.start &&
            w.endTime <= region.end &&
            w.type === "word"
        );
        words.forEach((word: TimelineEntry) => {
          const index = Math.round(
            ((word.startTime - region.start) / regionDuration) * data.length
          );
          labels[index] = word.text.trim();
        });
      } else if (region.id.startsWith("word-region")) {
        const words = caption.timeline.filter(
          (w: TimelineEntry) =>
            w.startTime >= region.start &&
            w.endTime <= region.end &&
            w.type === "word"
        );

        let phones: TimelineEntry[] = [];
        words.forEach((word: TimelineEntry) => {
          word.timeline.forEach((token: TimelineEntry) => {
            phones = phones.concat(token.timeline);
          });
        });

        phones.forEach((phone: TimelineEntry) => {
          const index = Math.round(
            ((phone.startTime - region.start) / regionDuration) * data.length
          );
          labels[index] = [
            labels[index] || "",
            (media?.language || learningLanguage).startsWith("en")
              ? convertIpaToNormal(phone.text.trim())
              : phone.text.trim(),
          ].join("");
        });
      }

      chartData = {
        labels,
        datasets: [
          {
            data,
            cubicInterpolationMode: "monotone",
          },
        ],
      };
    }

    setPitchChart(
      new Chart(canvas, {
        type: "line",
        data: chartData,
        options: {
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: false,
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                autoSkip: false,
              },
              display: true,
              grid: {
                display: false,
              },
              border: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              display: false,
            },
          },
        },
      })
    );
  };

  const calculateHeight = () => {
    if (window.innerHeight <= 1080) {
      setLayout({
        ...LAYOUT.sm,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    } else {
      setLayout({
        ...LAYOUT.lg,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  };

  const deboundeCalculateHeight = debounce(calculateHeight, 100);

  /*
   * When wavesurfer is decoded,
   * set up event listeners for wavesurfer
   * and clean up when component is unmounted
   */
  useEffect(() => {
    if (!wavesurfer) return;

    setRegions(wavesurfer.registerPlugin(Regions.create()));

    setCurrentTime(0);

    const subscriptions = [
      wavesurfer.on("timeupdate", (time: number) => setCurrentTime(time)),
      wavesurfer.on("decode", () => {
        const peaks: Float32Array = wavesurfer
          .getDecodedData()
          .getChannelData(0);
        const duration: number = wavesurfer.getDuration();
        const sampleRate = wavesurfer.options.sampleRate;
        const _frequencies = extractFrequencies({ peaks, sampleRate });
        const _waveform = {
          peaks: Array.from(peaks),
          duration,
          sampleRate,
          frequencies: _frequencies,
        };
        EnjoyApp.waveforms.save(media.md5, _waveform);
        setWaveForm(_waveform);
      }),
      wavesurfer.on("ready", () => {
        setDecoded(true);
      }),
      wavesurfer.on("error", (err: Error) => {
        toast.error(err?.message || "Error occurred while decoding audio");
        setDecodeError(err?.message || "Error occurred while decoding audio");
      }),
    ];

    return () => {
      subscriptions.forEach((unsub) => unsub());
      wavesurfer?.destroy();
    };
  }, [wavesurfer]);

  /*
   * update fitZoomRatio when currentSegmentIndex is updated
   */
  useEffect(() => {
    if (!ref?.current) return;
    if (!wavesurfer) return;

    if (!activeRegion) return;

    const containerWidth = ref.current.getBoundingClientRect().width;
    const duration = activeRegion.end - activeRegion.start;
    if (activeRegion.id.startsWith("word-region")) {
      setFitZoomRatio(containerWidth / 3 / duration / minPxPerSec);
    } else {
      setFitZoomRatio(containerWidth / duration / minPxPerSec);
    }

    return () => {
      setFitZoomRatio(1.0);
    };
  }, [ref, wavesurfer, activeRegion]);

  /*
   * Zoom chart when zoomRatio update
   */
  useEffect(() => {
    if (!wavesurfer) return;
    if (!decoded) return;

    wavesurfer.zoom(zoomRatio * minPxPerSec);
    if (!activeRegion) return;

    renderPitchContour(activeRegion);
    wavesurfer.setScrollTime(activeRegion.start);
  }, [zoomRatio, wavesurfer, decoded]);

  /*
   * Re-render pitch contour when active region changed
   */
  useEffect(() => {
    if (!activeRegion) return;

    renderPitchContour(activeRegion);
  }, [wavesurfer, activeRegion]);

  /*
   * Update player styles
   */
  useEffect(() => {
    if (!wavesurfer) return;
    if (!decoded) return;

    const scrollContainer = wavesurfer.getWrapper().closest(".scroll");
    scrollContainer.style.scrollbarWidth = "thin";
  }, [decoded, wavesurfer]);

  useEffect(() => {
    if (!media) return;

    EnjoyApp.waveforms.find(media.md5).then((waveform) => {
      setWaveForm(waveform);
    });
  }, [media?.md5]);

  /*
   * Initialize wavesurfer when container ref is available
   * and mediaProvider is available
   */
  useEffect(() => {
    initializeWavesurfer();

    return () => {
      if (wavesurfer) wavesurfer.destroy();
      setDecoded(false);
      setDecodeError(null);
    };
  }, [media?.src, ref, mediaProvider, layout?.playerHeight]);

  /* cache last segment index */
  useEffect(() => {
    if (!media) return;
    if (!currentSegmentIndex) return;

    setCachedSegmentIndex(currentSegmentIndex);
  }, [currentSegmentIndex]);

  /*
   * Update layout when window is resized
   * Abort transcription when component is unmounted
   */
  useEffect(() => {
    calculateHeight();

    EnjoyApp.window.onResize(() => {
      deboundeCalculateHeight();
    });

    return () => {
      EnjoyApp.window.removeListeners();
      abortGenerateTranscription();
    };
  }, []);

  return (
    <>
      <MediaPlayerProviderContext.Provider
        value={{
          layout,
          media,
          setMedia,
          setMediaProvider,
          wavesurfer,
          setRef,
          decoded,
          decodeError,
          setDecodeError,
          currentTime,
          currentSegmentIndex,
          setCurrentSegmentIndex,
          waveform,
          zoomRatio,
          setZoomRatio,
          fitZoomRatio,
          minPxPerSec,
          transcription,
          regions,
          renderPitchContour,
          pitchChart,
          activeRegion,
          setActiveRegion,
          editingRegion,
          setEditingRegion,
          generateTranscription,
          transcribing,
          transcribingProgress,
          transcribingOutput,
          transcriptionDraft,
          setTranscriptionDraft,
          isRecording,
          setIsRecording,
          currentRecording,
          setCurrentRecording,
          recordings,
          fetchRecordings,
          loadingRecordings,
          hasMoreRecordings,
          currentNotes: notes,
          createNote,
          currentSegment: segment,
          createSegment,
          getCachedSegmentIndex,
          setCachedSegmentIndex,
        }}
      >
        {children}
      </MediaPlayerProviderContext.Provider>
      <Tooltip className="z-10" id="media-player-tooltip" />
    </>
  );
};
