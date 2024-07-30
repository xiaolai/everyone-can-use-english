import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeHandler, useForm } from "react-hook-form";
import { z } from "zod";
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
  Avatar,
  AvatarFallback,
  Button,
  Checkbox,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@renderer/components/ui";
import { t } from "i18next";
import { ChangeEventHandler, useContext, useState } from "react";
import { CheckCircleIcon } from "lucide-react";
import { AppSettingsProviderContext } from "@renderer/context";
import { LANGUAGES } from "@/constants";

export const ChatForm = (props: {
  chat?: ChatType;
  chatAgents: ChatAgentType[];
  onSave: (data: {
    name: string;
    topic: string;
    language: string;
    members: Array<{ userId: string; userType: "User" | "Agent" }>;
  }) => void;
  onDestroy?: () => void;
}) => {
  const { chat, chatAgents, onSave, onDestroy } = props;
  const { user, learningLanguage, nativeLanguage } = useContext(
    AppSettingsProviderContext
  );
  const [editingMember, setEditingMember] = useState<{
    userId?: string;
    userType?: "User" | "Agent";
    prompt?: string;
    introduction?: string;
  } | null>();

  const chatFormSchema = z.object({
    name: z.string().min(1),
    topic: z.string(),
    language: z.string(),
    members: z
      .array(
        z
          .object({
            userId: z.string(),
            userType: z.enum(["User", "Agent"]).default("Agent"),
            prompt: z.string().optional(),
            introduction: z.string().optional(),
          })
          .required({
            userId: true,
            userType: true,
          })
      )
      .min(1),
  });

  const form = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    values: chat || {
      name: "New Chat",
      topic: "Casual Chat",
      language: learningLanguage,
      members: [
        {
          userId: user.id,
          userType: "User",
          introduction: `I am ${nativeLanguage} speaker learning ${learningLanguage}.`,
        },
      ],
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const { name, topic, language, members } = data;
    return onSave({
      name,
      topic,
      language,
      members: members.map((m) => ({
        userId: m.userId,
        userType: m.userType,
      })),
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="">
        <div className="mb-6">{chat?.id ? t("editChat") : t("newChat")}</div>
        <div className="space-y-4 mb-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("name")}</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("models.chatAgent.language")}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="text-xs">
                    <SelectValue>
                      {
                        LANGUAGES.find((lang) => lang.code === field.value)
                          ?.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem
                        className="text-xs"
                        value={lang.code}
                        key={lang.code}
                      >
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("topic")}</FormLabel>
                <Textarea className="max-h-96" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="members"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("members")}({field.value.length})
                </FormLabel>
                <ScrollArea className="w-full h-36 bg-muted rounded-lg p-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={`flex items-center space-x-1 px-2 py-1 rounded-lg w-full overflow-hidden relative hover:bg-background hover:border cursor-pointer ${
                        editingMember?.userId === user.id
                          ? "bg-background border"
                          : ""
                      }`}
                      onClick={() => {
                        const member = field.value.find(
                          (m) => m.userId === user.id
                        );
                        setEditingMember(
                          member || {
                            userId: user.id,
                            userType: "User",
                          }
                        );
                      }}
                    >
                      <Avatar className="w-10 h-10">
                        <img src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm line-clamp-1">{user.name}</div>
                      </div>
                      <CheckCircleIcon className="absolute top-2 right-2 w-4 h-4 text-green-500" />
                    </div>
                    {chatAgents
                      .filter((a) => a.language === form.watch("language"))
                      .map((chatAgent) => (
                        <div
                          key={chatAgent.id}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-lg w-full overflow-hidden relative cursor-pointer hover:bg-background hover:border ${
                            editingMember?.userId === chatAgent.id
                              ? "bg-background border"
                              : ""
                          }`}
                          onClick={() => {
                            const member = field.value.find(
                              (m) => m.userId === chatAgent.id
                            );
                            if (editingMember?.userId === chatAgent.id) {
                              setEditingMember(null);
                            } else {
                              setEditingMember(
                                member || {
                                  userId: chatAgent.id,
                                  userType: "Agent",
                                }
                              );
                            }
                          }}
                        >
                          <Avatar className="w-12 h-12">
                            <img
                              src={chatAgent.avatarUrl}
                              alt={chatAgent.name}
                            />
                            <AvatarFallback>{chatAgent.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm line-clamp-1">
                              {chatAgent.name}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {chatAgent.introduction}
                            </div>
                          </div>
                          {field.value.findIndex(
                            (m) => m.userId === chatAgent.id
                          ) > -1 && (
                            <CheckCircleIcon className="absolute top-2 right-2 w-4 h-4 text-green-500" />
                          )}
                        </div>
                      ))}
                  </div>
                </ScrollArea>
                {editingMember && (
                  <MemberForm
                    topic={form.watch("topic")}
                    members={form.watch("members")}
                    member={editingMember}
                    chatAgents={chatAgents}
                    checked={
                      field.value.findIndex(
                        (m) => m.userId === editingMember.userId
                      ) > -1
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([
                          ...field.value,
                          {
                            ...editingMember,
                            prompt: "",
                          },
                        ]);
                      } else {
                        field.onChange(
                          field.value.filter(
                            (m) => m.userId !== editingMember.userId
                          )
                        );
                      }
                    }}
                    onPromptChange={(event) => {
                      const prompt = event.target.value;

                      editingMember.prompt = prompt;
                      field.onChange([
                        ...field.value.filter(
                          (m) => m.userId !== editingMember.userId
                        ),
                        editingMember,
                      ]);
                    }}
                    onIntroductionChange={(event) => {
                      const introduction = event.target.value;

                      editingMember.introduction = introduction;
                      field.onChange([
                        ...field.value.filter(
                          (m) => m.userId !== editingMember.userId
                        ),
                        editingMember,
                      ]);
                    }}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center space-x-4">
          {chat?.id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="text-destructive" variant="secondary">
                  {t("delete")}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("deleteChatAgent")}</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                  {t("deleteChatAgentConfirmation")}
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive-hover"
                    onClick={onDestroy}
                  >
                    {t("delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button>{t("save")}</Button>
        </div>
      </form>
    </Form>
  );
};

const MemberForm = (props: {
  topic: string;
  members: Array<{ userId?: string; userType?: "User" | "Agent" }>;
  member: {
    userId?: string;
    userType?: "User" | "Agent";
    prompt?: string;
    introduction?: string;
  };
  chatAgents: ChatAgentType[];
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onPromptChange: ChangeEventHandler<HTMLTextAreaElement>;
  onIntroductionChange: ChangeEventHandler<HTMLTextAreaElement>;
}) => {
  const {
    topic,
    members,
    member,
    chatAgents,
    checked,
    onCheckedChange,
    onPromptChange,
    onIntroductionChange,
  } = props;
  const { user, learningLanguage, nativeLanguage } = useContext(
    AppSettingsProviderContext
  );
  const chatAgent = chatAgents.find((a) => a.id === member.userId);

  const fullPrompt =
    chatAgent &&
    `${chatAgent.config.prompt}
You are chatting in a chat room. You always reply in ${
      LANGUAGES.find((lang) => lang.code === chatAgent.language).name
    }.
${member.prompt || ""}

<Chat Topic>
${topic}

<Chat Members>
${members
  .map((m) => {
    if (m.userType === "User") {
      return `- ${user.name} (${nativeLanguage} speaker, learning ${learningLanguage})`;
    } else {
      const agent = chatAgents.find((a) => a.id === m.userId);
      if (!agent) return "";
      return `- ${agent.name} (${agent.introduction})`;
    }
  })
  .join("\n")}
`;

  if (member.userType === "User") {
    return (
      <>
        <FormLabel>{t("memberConfig")}</FormLabel>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Avatar className="w-12 h-12">
              <img src={user.avatarUrl} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm line-clamp-1">{user.name}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox checked={true} disabled id="member" />
            <Label htmlFor="member">{t("addToChat")}</Label>
          </div>
          <div className="space-y-2">
            <FormLabel>{t("introduction")}</FormLabel>
            <Textarea
              value={member.introduction}
              onChange={onIntroductionChange}
              placeholder={t("introduceYourself")}
            />
          </div>
        </div>
      </>
    );
  } else if (chatAgent) {
    return (
      <>
        <FormLabel>{t("memberConfig")}</FormLabel>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Avatar className="w-12 h-12">
              <img src={chatAgent.avatarUrl} />
              <AvatarFallback>{chatAgent.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm line-clamp-1">{chatAgent.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {chatAgent.introduction}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              checked={checked}
              onCheckedChange={onCheckedChange}
              id="member"
            />
            <Label htmlFor="member">{t("addToChat")}</Label>
          </div>
          {checked && (
            <>
              <div className="space-y-2">
                <FormLabel>{t("prompt")}</FormLabel>
                <Textarea
                  value={member.prompt}
                  onChange={onPromptChange}
                  placeholder={t("extraPromptForChat")}
                />
              </div>
              <div className="space-y-2">
                <FormLabel>{t("promptPreview")}</FormLabel>
                <Textarea className="min-h-36" disabled value={fullPrompt} />
              </div>
            </>
          )}
        </div>
      </>
    );
  }
};
