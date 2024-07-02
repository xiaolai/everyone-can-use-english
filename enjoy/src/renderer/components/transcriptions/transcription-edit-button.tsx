import { MediaPlayerProviderContext } from "@renderer/context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
  toast,
} from "@renderer/components/ui";
import { TimelineEntry } from "echogarden/dist/utilities/Timeline";
import { t } from "i18next";
import { useContext, useState } from "react";
import { LoaderIcon } from "lucide-react";

export const TranscriptionEditButton = (props: {
  children?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const { transcription, generateTranscription } = useContext(
    MediaPlayerProviderContext
  );
  const [content, setContent] = useState<string>(
    transcription.result.timeline.map((t: TimelineEntry) => t.text).join("\n\n")
  );

  const handleSave = async () => {
    setSubmiting(true);
    generateTranscription({ originalText: content })
      .then(() => setOpen(false))
      .catch((e) => {
        toast.error(e.message);
      })
      .finally(() => setSubmiting(false));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.children ? (
          props.children
        ) : (
          <Button variant="outline" size="sm">
            <span className="capitalize">{t("edit")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-screen-sm xl:max-w-screen-md">
        <DialogHeader>
          <DialogTitle>{t("editTranscription")}</DialogTitle>
        </DialogHeader>
        <div>
          <Textarea
            disabled={submiting}
            className="h-96 text-lg font-serif resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={submiting} variant="secondary">
              {t("cancel")}
            </Button>
          </DialogClose>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={submiting}>
                {submiting && <LoaderIcon className="animate-spin w-4 mr-2" />}
                {t("save")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("saveTranscription")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("areYouSureToSaveTranscription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={submiting}>
                  {t("cancel")}
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button disabled={submiting} onClick={handleSave}>
                    {submiting && (
                      <LoaderIcon className="animate-spin w-4 mr-2" />
                    )}
                    {t("save")}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
