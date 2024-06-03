import { t } from "i18next";
import { useForm } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@renderer/components/ui";
import { useContext } from "react";
import { AppSettingsProviderContext } from "@renderer/context";

export const ConversationFormTTS = (props: {
  form: ReturnType<typeof useForm>;
  ttsProviders: any;
}) => {
  const { form, ttsProviders } = props;
  const { learningLanguage } = useContext(AppSettingsProviderContext);

  return (
    <>
      <FormField
        control={form.control}
        name="configuration.tts.engine"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("models.conversation.ttsEngine")}</FormLabel>
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

      {ttsProviders[
        form.watch("configuration.tts.engine")
      ]?.configurable?.includes("model") && (
        <FormField
          control={form.control}
          name="configuration.tts.model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("models.conversation.ttsModel")}</FormLabel>
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
                  {(
                    ttsProviders[form.watch("configuration.tts.engine")]
                      ?.models || []
                  ).map((model: string) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {ttsProviders[
        form.watch("configuration.tts.engine")
      ]?.configurable?.includes("voice") && (
        <FormField
          control={form.control}
          name="configuration.tts.voice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("models.conversation.ttsVoice")}</FormLabel>
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
                    (form.watch("configuration.tts.engine") === "enjoyai"
                      ? ttsProviders["enjoyai"]["voices"][
                          form.watch("configuration.tts.model").split("/")[0]
                        ]?.[learningLanguage]
                      : ttsProviders[form.watch("configuration.tts.engine")]
                          .voices) || []
                  ).map((voice: any) => (
                    <SelectItem key={voice} value={voice}>
                      <span className="capitalize">{voice}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {ttsProviders[
        form.watch("configuration.tts.engine")
      ]?.configurable.includes("baseUrl") && (
        <FormField
          control={form.control}
          name="configuration.tts.baseUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("models.conversation.ttsBaseUrl")}</FormLabel>
              <Input
                {...field}
                placeholder={t("models.conversation.ttsBaseUrlDescription")}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
