import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@renderer/components/ui";
import { t } from "i18next";
import { useContext, useState } from "react";
import { CheckCircleIcon, CheckIcon } from "lucide-react";
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
  const { user, learningLanguage } = useContext(AppSettingsProviderContext);

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
          })
          .required({
            userId: true,
            userType: true,
          })
          .required()
      )
      .min(1),
  });

  const form = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    values: chat || {
      name: "New Chat",
      topic: "Casual Chat",
      language: learningLanguage,
      members: [],
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
        <div className="">{chat?.id ? t("editChat") : t("newChat")}</div>
        <div className="space-y-4 px-2 mb-6">
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
                  {t("members")}({field.value.length + 1})
                </FormLabel>
                <ScrollArea className="w-full h-48">
                  <div className="grid grid-cols-3 gap-2 p-2 rounded bg-muted">
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-lg w-full overflow-hidden relative cursor-pointer bg-background border">
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
                            field.value.findIndex(
                              (m) => m.userId === chatAgent.id
                            ) > -1
                              ? "bg-background border"
                              : ""
                          }`}
                          onClick={() => {
                            if (
                              field.value.findIndex(
                                (m) => m.userId === chatAgent.id
                              ) > -1
                            ) {
                              field.onChange(
                                field.value.filter(
                                  (m) => m.userId !== chatAgent.id
                                )
                              );
                            } else {
                              field.onChange([
                                ...field.value,
                                {
                                  userId: chatAgent.id,
                                  userType: "Agent",
                                },
                              ]);
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
                            <div className="text-xs text-muted-foreground truncate">
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
