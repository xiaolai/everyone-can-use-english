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
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Textarea,
  toast,
} from "@renderer/components/ui";
import { t } from "i18next";
import { LANGUAGES } from "@/constants";
import {
  AISettingsProviderContext,
  AppSettingsProviderContext,
} from "@renderer/context";
import { useContext, useEffect, useState } from "react";
import { GPT_PROVIDERS, TTS_PROVIDERS } from "@renderer/components";

export const ChatAgentForm = (props: {
  agent?: ChatAgentType;
  onSave?: (agent: ChatAgentType) => void;
}) => {
  const { agent, onSave } = props;
  const { learningLanguage, webApi, EnjoyApp } = useContext(
    AppSettingsProviderContext
  );
  const { openai } = useContext(AISettingsProviderContext);
  const [gptProviders, setGptProviders] = useState<any>(GPT_PROVIDERS);
  const [ttsProviders, setTtsProviders] = useState<any>(TTS_PROVIDERS);

  const agentFormSchema = z.object({
    name: z.string(),
    introduction: z.string(),
    language: z.string(),
    engine: z.enum(["enjoyai", "openai", "ollama"]),
    model: z.string(),
    prompt: z.string(),
    temperature: z.number().optional(),
    ttsEngine: z.enum(["enjoyai", "openai"]),
    ttsModel: z.string(),
    ttsVoice: z.string(),
  });

  const form = useForm<z.infer<typeof agentFormSchema>>({
    resolver: zodResolver(agentFormSchema),
    values: agent || {
      name: "",
      language: learningLanguage,
      introduction: "",
      engine: "enjoyai",
      model: "gpt-4o",
      temperature: 0.7,
      ttsEngine: "enjoyai",
      ttsModel: "azure/speech",
      ttsVoice: ttsProviders?.enjoyai?.voices?.["azure"].find(
        (voice: any) => voice?.language === learningLanguage
      )?.value,
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const { name, language, introduction, ...config } = data;
    if (agent?.id) {
      EnjoyApp.chatAgents
        .update(agent.id, {
          name,
          language,
          introduction,
          config,
        })
        .then((agent) => {
          toast.success(t("chatAgentSaved"));
          onSave?.(agent);
        })
        .catch((e) => {
          toast.error(t(e.message));
        });
    } else {
      EnjoyApp.chatAgents
        .create({
          name,
          language,
          introduction,
          config,
        })
        .then((agent) => {
          toast.success(t("chatAgentSaved"));
          onSave?.(agent);
        })
        .catch((e) => {
          toast.error(t(e.message));
        });
    }
  });

  const refreshGptProviders = async () => {
    let providers = GPT_PROVIDERS;

    try {
      const config = await webApi.config("gpt_providers");
      providers = Object.assign(providers, config);
    } catch (e) {
      console.warn(`Failed to fetch remote GPT config: ${e.message}`);
    }

    try {
      const response = await fetch(providers["ollama"]?.baseUrl + "/api/tags");
      providers["ollama"].models = (await response.json()).models.map(
        (m: any) => m.name
      );
    } catch (e) {
      console.warn(`No ollama server found: ${e.message}`);
    }

    if (openai.models) {
      providers["openai"].models = openai.models.split(",");
    }

    setGptProviders({ ...providers });
  };

  const destroyChatAgent = async () => {
    EnjoyApp.chatAgents
      .destroy(agent.id)
      .then(() => {
        onSave?.(null);
      })
      .catch((e) => {
        toast.error(t(e.message));
      });
  };

  const refreshTtsProviders = async () => {
    let providers = TTS_PROVIDERS;

    try {
      const config = await webApi.config("tts_providers_v2");
      providers = Object.assign(providers, config);
    } catch (e) {
      console.warn(`Failed to fetch remote TTS config: ${e.message}`);
    }

    setTtsProviders({ ...providers });
  };

  useEffect(() => {
    refreshGptProviders();
    refreshTtsProviders();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <div className="mb-4">{agent?.id ? t("editAgent") : t("newAgent")}</div>
        <div className="space-y-4 px-2 mb-6">
          {form.watch("name") && (
            <Avatar className="w-16 h-16 border">
              <img
                src={`https://api.dicebear.com/9.x/croodles/svg?seed=${form.watch(
                  "name"
                )}`}
                alt={form.watch("name")}
              />
            </Avatar>
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("models.chatAgent.name")}</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="introduction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("models.chatAgent.introduction")}</FormLabel>
                <Textarea className="max-h-36" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("models.chatAgent.prompt")}</FormLabel>
                <Textarea className="max-h-48" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="engine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("models.chatAgent.engine")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectAiEngine")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(gptProviders).map((key) => (
                      <SelectItem key={key} value={key}>
                        {gptProviders[key].name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {gptProviders[form.watch("engine")]?.description}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("models.chatAgent.model")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectAiModel")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(gptProviders[form.watch("engine")]?.models || []).map(
                      (option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("models.chatAgent.temperature")}</FormLabel>
                <div className="flex items-center space-x-1">
                  <Slider
                    className="flex-1"
                    onValueChange={(value) => field.onChange(value[0])}
                    defaultValue={[field.value]}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                  <span>{field.value}</span>
                </div>
                <FormDescription>
                  {t("models.chatAgent.temperatureDescription")}
                </FormDescription>
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
                <Select {...field}>
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
            name="ttsEngine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("models.chatAgent.ttsEngine")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectTtsEngine")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(ttsProviders).map((key) => (
                      <SelectItem key={key} value={key}>
                        {ttsProviders[key].name}
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
            name="ttsModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("models.chatAgent.ttsModel")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectTtsModel")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(ttsProviders[form.watch("ttsEngine")]?.models || []).map(
                      (model: string) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ttsVoice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("models.chatAgent.ttsVoice")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectTtsVoice")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(
                      (form.watch("ttsEngine") === "enjoyai"
                        ? ttsProviders.enjoyai.voices[
                            form.watch("ttsModel")?.split("/")?.[0]
                          ]
                        : ttsProviders[form.watch("ttsEngine")].voices) || []
                    ).map((voice: any) => {
                      if (typeof voice === "string") {
                        return (
                          <SelectItem key={voice} value={voice}>
                            <span className="capitalize">{voice}</span>
                          </SelectItem>
                        );
                      } else if (voice.language === form.watch("language")) {
                        return (
                          <SelectItem key={voice.value} value={voice.value}>
                            <span className="capitalize">{voice.label}</span>
                          </SelectItem>
                        );
                      }
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center space-x-4">
          {agent?.id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="text-destructive"
                  variant="secondary"
                >
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
                    onClick={destroyChatAgent}
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
