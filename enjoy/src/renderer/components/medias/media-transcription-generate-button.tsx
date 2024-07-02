import { useContext, useState } from "react";
import { MediaPlayerProviderContext } from "@renderer/context";
import { t } from "i18next";
import {
  Button,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  toast,
} from "@renderer/components/ui";
import { LoaderIcon } from "lucide-react";
import { TranscriptionCreateForm } from "../transcriptions";

export const MediaTranscriptionGenerateButton = (props: {
  children: React.ReactNode;
}) => {
  const {
    media,
    generateTranscription,
    transcribing,
    transcription,
    transcribingProgress,
    transcribingOutput,
  } = useContext(MediaPlayerProviderContext);
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger disabled={transcribing} asChild>
        {props.children ? (
          props.children
        ) : (
          <Button
            disabled={transcribing}
            variant="outline"
            className="min-w-max"
          >
            {(transcribing || transcription.state === "processing") && (
              <LoaderIcon className="animate-spin w-4 mr-2" />
            )}
            <span>
              {transcription.result ? t("regenerate") : t("transcribe")}
            </span>
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("transcribe")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("transcribeMediaConfirmation", {
              name: media.name,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <TranscriptionCreateForm
          onCancel={() => setOpen(false)}
          onSubmit={(data) => {
            generateTranscription({
              originalText: data.text,
              language: data.language,
              service: data.service as WhisperConfigType["service"],
            })
              .then(() => {
                setOpen(false);
              })
              .catch((e) => {
                toast.error(e.message);
              });
          }}
          transcribing={transcribing}
          transcribingProgress={transcribingProgress}
          transcribingOutput={transcribingOutput}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
};
