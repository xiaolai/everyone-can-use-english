import {
  AppSettingsProviderContext,
  AISettingsProviderContext,
} from "@renderer/context";
import OpenAI from "openai";
import { useContext, useState } from "react";
import { t } from "i18next";
import { AI_WORKER_ENDPOINT } from "@/constants";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import axios from "axios";
import { useAiCommand } from "./use-ai-command";
import { toast } from "@renderer/components/ui";
import {
  Timeline,
  TimelineEntry,
  type TimelineEntryType,
} from "echogarden/dist/utilities/Timeline";
import take from "lodash/take";
import sortedUniqBy from "lodash/sortedUniqBy";
import { parseText } from "media-captions";

// test a text string has any punctuations or not
// some transcribed text may not have any punctuations
const punctuationsPattern = /\w[.,!?](\s|$)/g;

export const useTranscribe = () => {
  const { EnjoyApp, user, webApi } = useContext(AppSettingsProviderContext);
  const { openai } = useContext(AISettingsProviderContext);
  const { punctuateText } = useAiCommand();
  const [output, setOutput] = useState<string>("");

  const transcode = async (src: string | Blob): Promise<string> => {
    if (src instanceof Blob) {
      src = await EnjoyApp.cacheObjects.writeFile(
        `${Date.now()}.${src.type.split("/")[1].split(";")[0]}`,
        await src.arrayBuffer()
      );
    }

    const output = await EnjoyApp.echogarden.transcode(src);
    return output;
  };

  const transcribe = async (
    mediaSrc: string | Blob,
    params?: {
      targetId?: string;
      targetType?: string;
      originalText?: string;
      language: string;
      service: WhisperConfigType["service"] | "upload";
      isolate?: boolean;
      align?: boolean;
    }
  ): Promise<{
    engine: string;
    model: string;
    transcript: string;
    timeline: TimelineEntry[];
    originalText?: string;
    tokenId?: number;
    url: string;
  }> => {
    const url = await transcode(mediaSrc);
    const {
      targetId,
      targetType,
      originalText,
      language,
      service,
      isolate = false,
      align = true,
    } = params || {};
    const blob = await (await fetch(url)).blob();

    let result: any;
    let timeline: Timeline = [];
    if (service === "upload" && originalText) {
      const caption = await parseText(originalText, { type: "srt" });
      if (caption.cues.length > 0) {
        timeline = caption.cues.map((cue) => {
          return {
            type: "sentence",
            text: cue.text,
            startTime: cue.startTime,
            endTime: cue.endTime,
            timeline: [],
          };
        });
        result = {
          engine: "upload",
          model: "-",
          text: timeline.map((entry) => entry.text).join(" "),
          timeline,
        };
      } else {
        result = {
          engine: "upload",
          model: "-",
          text: originalText,
        };
      }
    } else if (service === "local") {
      result = await transcribeByLocal(url, language);
    } else if (service === "cloudflare") {
      result = await transcribeByCloudflareAi(blob);
    } else if (service === "openai") {
      result = await transcribeByOpenAi(
        new File([blob], "audio.mp3", { type: "audio/mp3" })
      );
    } else if (service === "azure") {
      result = await transcribeByAzureAi(
        new File([blob], "audio.wav", { type: "audio/wav" }),
        language,
        {
          targetId,
          targetType,
        }
      );
    } else {
      throw new Error(t("whisperServiceNotSupported"));
    }

    let transcript = result.text;
    if (!align) {
      return {
        ...result,
        transcript,
        url,
      };
    }

    /*
     * if timeline is available and the transcript contains punctuations
     * use `alignSegments` to align each sentence with the timeline
     * otherwise, use `align` to align the whole transcript
     * if the transcript does not contain any punctuation, use AI command to add punctuation
     */
    if (result.timeline?.length && transcript.match(punctuationsPattern)) {
      timeline = [...result.timeline];
      setOutput("Aligning the transcript...");
      const wordTimeline = await EnjoyApp.echogarden.alignSegments(
        new Uint8Array(await blob.arrayBuffer()),
        timeline,
        {
          language,
          isolate,
        }
      );
      timeline = await EnjoyApp.echogarden.wordToSentenceTimeline(
        wordTimeline,
        transcript,
        language.split("-")[0]
      );
    } else {
      // Remove all content inside `()`, `[]`, `{}` and trim the text
      // remove all markdown formatting
      transcript = transcript
        .replace(/\(.*?\)/g, "")
        .replace(/\[.*?\]/g, "")
        .replace(/\{.*?\}/g, "")
        .replace(/[*_`]/g, "")
        .trim();

      // if the transcript does not contain any punctuation, use AI command to add punctuation
      if (!transcript.match(punctuationsPattern)) {
        try {
          transcript = await punctuateText(transcript);
        } catch (err) {
          toast.error(err.message);
          console.warn(err.message);
        }
      }

      setOutput("Aligning the transcript...");
      const alignmentResult = await EnjoyApp.echogarden.align(
        new Uint8Array(await blob.arrayBuffer()),
        transcript,
        {
          language,
          isolate,
        }
      );

      alignmentResult.timeline.forEach((t: TimelineEntry) => {
        if (t.type === "sentence") {
          timeline.push(t);
        } else {
          t.timeline.forEach((st) => {
            timeline.push(st);
          });
        }
      });
    }

    return {
      ...result,
      originalText,
      transcript,
      timeline,
      url,
    };
  };

  const transcribeByLocal = async (
    url: string,
    language?: string
  ): Promise<{
    engine: string;
    model: string;
    text: string;
    timeline: TimelineEntry[];
  }> => {
    const res = await EnjoyApp.whisper.transcribe(
      {
        file: url,
      },
      {
        language,
        force: true,
        extra: ["--prompt", `"Hello! Welcome to listen to this audio."`],
      }
    );

    const timeline: TimelineEntry[] = res.transcription
      .map((segment) => {
        // ignore the word if it is empty or in the format of `[xxx]` or `(xxx)`
        if (
          !segment.text.trim() ||
          segment.text.trim().match(/^[\[\(].+[\]\)]$/)
        ) {
          return null;
        }

        return {
          type: "segment" as TimelineEntryType,
          text: segment.text.trim(),
          startTime: segment.offsets.from / 1000.0,
          endTime: segment.offsets.to / 1000.0,
        };
      })
      .filter((s) => Boolean(s?.text));

    const transcript = timeline
      .map((segment) => segment.text)
      .join(" ")
      .trim();

    return {
      engine: "whisper",
      model: res.model.type,
      text: transcript,
      timeline,
    };
  };

  const transcribeByOpenAi = async (file: File) => {
    if (!openai?.key) {
      throw new Error(t("openaiKeyRequired"));
    }

    const client = new OpenAI({
      apiKey: openai.key,
      baseURL: openai.baseUrl,
      dangerouslyAllowBrowser: true,
      maxRetries: 0,
    });

    const res: {
      text: string;
      words?: { word: string; start: number; end: number }[];
      segments?: { text: string; start: number; end: number }[];
    } = (await client.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    })) as any;

    let timeline: TimelineEntry[] = [];
    if (res.segments) {
      res.segments.forEach((segment) => {
        const segmentTimeline = {
          type: "segment" as TimelineEntryType,
          text: segment.text,
          startTime: segment.start,
          endTime: segment.end,
          timeline: [] as Timeline,
        };

        timeline.push(segmentTimeline);
      });
    }

    return {
      engine: "openai",
      model: "whisper-1",
      text: res.text,
      timeline,
    };
  };

  const transcribeByCloudflareAi = async (
    blob: Blob
  ): Promise<{
    engine: string;
    model: string;
    text: string;
    timeline?: TimelineEntry[];
  }> => {
    const res: CfWhipserOutputType = (
      await axios.postForm(`${AI_WORKER_ENDPOINT}/audio/transcriptions`, blob, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
        timeout: 1000 * 60 * 5,
      })
    ).data;

    const caption = await parseText(res.vtt, { type: "vtt" });
    const timeline: Timeline = caption.cues.map((cue) => {
      return {
        type: "segment",
        text: cue.text,
        startTime: cue.startTime,
        endTime: cue.endTime,
        timeline: [],
      };
    });

    return {
      engine: "cloudflare",
      model: "@cf/openai/whisper",
      text: res.text,
      timeline,
    };
  };

  const transcribeByAzureAi = async (
    file: File,
    language: string,
    params?: {
      targetId?: string;
      targetType?: string;
    }
  ): Promise<{
    engine: string;
    model: string;
    text: string;
    tokenId: number;
    timeline?: TimelineEntry[];
  }> => {
    const { id, token, region } = await webApi.generateSpeechToken({
      ...params,
      purpose: "transcribe",
    });
    const config = sdk.SpeechConfig.fromAuthorizationToken(token, region);
    const audioConfig = sdk.AudioConfig.fromWavFileInput(file);
    // setting the recognition language to learning language, such as 'en-US'.
    config.speechRecognitionLanguage = language;
    config.requestWordLevelTimestamps();
    config.outputFormat = sdk.OutputFormat.Detailed;

    // create the speech recognizer.
    const reco = new sdk.SpeechRecognizer(config, audioConfig);

    let results: SpeechRecognitionResultType[] = [];

    const res: {
      engine: string;
      model: string;
      text: string;
      tokenId: number;
      timeline?: TimelineEntry[];
    } = await new Promise((resolve, reject) => {
      reco.recognizing = (_s, e) => {
        setOutput(e.result.text);
      };

      reco.recognized = (_s, e) => {
        const json = e.result.properties.getProperty(
          sdk.PropertyId.SpeechServiceResponse_JsonResult
        );
        const result = JSON.parse(json);
        results = results.concat(result);
      };

      reco.canceled = (_s, e) => {
        if (e.reason === sdk.CancellationReason.Error) {
          return reject(new Error(e.errorDetails));
        }

        reco.stopContinuousRecognitionAsync();
        console.log("CANCELED: Reason=" + e.reason);
      };

      reco.sessionStopped = async (_s, e) => {
        console.log(
          "Session stopped. Stop continuous recognition.",
          e.sessionId,
          results
        );
        reco.stopContinuousRecognitionAsync();

        try {
          const timeline: Timeline = [];
          results.forEach((result) => {
            if (!result.DisplayText) return;

            const best = take(sortedUniqBy(result.NBest, "Confidence"), 1)[0];
            if (!best.Words) return;
            if (!best.Confidence || best.Confidence < 0.5) return;

            const firstWord = best.Words[0];
            const lastWord = best.Words[best.Words.length - 1];

            timeline.push({
              type: "sentence",
              text: best.Display,
              startTime: firstWord.Offset / 10000000.0,
              endTime: (lastWord.Offset + lastWord.Duration) / 10000000.0,
              timeline: [],
            });
          });

          const transcript = timeline
            .map((result) => result.text)
            .join(" ")
            .trim();

          resolve({
            engine: "azure",
            model: "whisper",
            text: transcript,
            timeline,
            tokenId: id,
          });
        } catch (err) {
          reject(err);
        }
      };

      reco.startContinuousRecognitionAsync();
    });

    return res;
  };

  return {
    transcode,
    transcribe,
    output,
  };
};
