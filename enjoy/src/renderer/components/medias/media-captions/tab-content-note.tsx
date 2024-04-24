import {
  AppSettingsProviderContext,
  MediaPlayerProviderContext,
} from "@renderer/context";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TabsContent,
  Textarea,
  toast,
} from "@renderer/components/ui";
import { TimelineEntry } from "echogarden/dist/utilities/Timeline";
import { t } from "i18next";
import { useContext, useEffect, useRef, useState } from "react";
import { useNotes } from "@/renderer/hooks";
import Markdown from "react-markdown";
import { MoreHorizontalIcon } from "lucide-react";

/*
 * Note tab content.
 */
export function TabContentNote(props: {
  currentSegmentIndex: number;
  caption: TimelineEntry;
  selectedIndices: number[];
}) {
  const { currentSegmentIndex, caption, selectedIndices } = props;
  const { media } = useContext(MediaPlayerProviderContext);
  const { EnjoyApp } = useContext(AppSettingsProviderContext);
  const [segment, setSegment] = useState<SegmentType>();

  const findSegment = () => {
    if (!media) return;

    EnjoyApp.segments
      .findAll({
        targetId: media.id,
        targetType: media.mediaType,
        segmentIndex: currentSegmentIndex,
      })
      .then((segments) => {
        if (segments.length) {
          setSegment(segments[0]);
        }
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const createSegment = () => {
    if (!media) return;

    EnjoyApp.segments
      .create({
        targetId: media.id,
        targetType: media.mediaType,
        segmentIndex: currentSegmentIndex,
      })
      .then((segment) => {
        setSegment(segment);
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  useEffect(() => {
    if (!media) return;

    findSegment();
  }, [currentSegmentIndex]);

  if (!segment)
    return (
      <TabsContent value="note">
        <div className="py-4 flex justify-center items-center">
          <Button onClick={createSegment}>{t("startToNote")}</Button>
        </div>
      </TabsContent>
    );

  return (
    <TabsContent value="note">
      <div className="py-4">
        <SegmentNotes segment={segment} selectedIndices={selectedIndices} />
      </div>
    </TabsContent>
  );
}

const SegmentNotes = (props: {
  segment: SegmentType;
  selectedIndices: number[];
}) => {
  const { segment, selectedIndices } = props;
  const [editingNote, setEditingNote] = useState<NoteType>();

  const { notes, findNotes, hasMore } = useNotes({
    targetId: segment?.id,
    targetType: "Segment",
  });

  if (!segment) return null;

  return (
    <div className="">
      {!editingNote && (
        <div className="mb-4">
          <NoteForm
            segment={segment}
            parameters={{ wordIndices: selectedIndices }}
          />
        </div>
      )}

      <div className="space-y-4 mb-4">
        {notes.map((note) => (
          <div key={note.id} className="flex space-x-2">
            {editingNote?.id === note.id ? (
              <NoteForm
                segment={segment}
                parameters={{ wordIndices: selectedIndices }}
                note={note}
                onSave={() => setEditingNote(null)}
              />
            ) : (
              <NoteCard note={note} onEdit={() => setEditingNote(note)} />
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center my-4">
          <Button
            variant="link"
            onClick={() => findNotes({ offset: notes.length })}
          >
            {t("loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
};

const NoteCard = (props: {
  note: NoteType;
  onEdit?: (note: NoteType) => void;
}) => {
  const { note, onEdit } = props;
  const { EnjoyApp } = useContext(AppSettingsProviderContext);
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const handleDelete = () => {
    EnjoyApp.notes.delete(note.id);
  };

  return (
    <div className="w-full border rounded-lg p-4">
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex justify-between mb-2"
      >
        <span className="text-muted-foreground text-sm">
          {new Date(note.createdAt).toLocaleString()}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-6 h-6">
              <MoreHorizontalIcon className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onEdit && onEdit(note)}>
              {t("edit")}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleDelete}>
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {collapsed ? (
        <div className="text-sm line-clamp-1">{note.content}</div>
      ) : (
        <Markdown className="prose-sm dark:prose-invert max-w-full">
          {note.content}
        </Markdown>
      )}
    </div>
  );
};

const NoteForm = (props: {
  segment: SegmentType;
  parameters: any;
  note?: NoteType;
  onSave?: (note: NoteType) => void;
}) => {
  const { segment, parameters, note, onSave } = props;
  const [content, setContent] = useState<string>(note?.content ?? "");
  const { EnjoyApp } = useContext(AppSettingsProviderContext);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    if (!inputRef.current) return;

    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  };

  const handleSubmit = () => {
    if (!content) return;

    if (note) {
      EnjoyApp.notes
        .update(note.id, { content, parameters })
        .then((note) => {
          onSave && onSave(note);
        })
        .catch((err) => {
          toast.error(err.message);
        });
    } else {
      EnjoyApp.notes
        .create({
          targetId: segment.id,
          targetType: "Segment",
          parameters,
          content,
        })
        .then((note) => {
          onSave && onSave(note);
          setContent("");
        })
        .catch((err) => {
          toast.error(err.message);
        });
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [content]);

  return (
    <div className="w-full">
      <div className="mb-2">
        <Textarea
          ref={inputRef}
          className="w-full"
          value={content}
          placeholder={t("writeNoteHere")}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSubmit}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
};
