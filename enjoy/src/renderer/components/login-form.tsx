import { Button, toast, Separator } from "@renderer/components/ui";
import { useContext, useEffect, useRef, useState } from "react";
import { AppSettingsProviderContext } from "@renderer/context";
import { t } from "i18next";
import { UserSettings, LanguageSettings } from "@renderer/components";
import { ChevronLeftIcon } from "lucide-react";

export const LoginForm = () => {
  const { EnjoyApp, login, webApi, user } = useContext(
    AppSettingsProviderContext
  );
  const [webviewVisible, setWebviewVisible] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleLogin = (provider: "mixin" | "github") => {
    const url = `${webApi.baseUrl}/sessions/new?provider=${provider}`;
    setWebviewVisible(true);

    const rect = containerRef.current.getBoundingClientRect();
    EnjoyApp.view.load(
      url,
      {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      {
        navigatable: true,
      }
    );
  };

  const onViewState = (event: {
    state: string;
    error?: string;
    url?: string;
    html?: string;
  }) => {
    const { state, url, error } = event;

    if (error) {
      toast.error(error);
      EnjoyApp.view.hide();
      return;
    }

    if (state === "will-navigate" || state === "will-redirect") {
      if (!url.startsWith(webApi.baseUrl)) {
        return;
      }

      const provider = new URL(url).pathname.split("/")[2] as
        | "mixin"
        | "github";
      const code = new URL(url).searchParams.get("code");

      if (provider && code) {
        webApi
          .auth({ provider, code })
          .then((user) => {
            if (user?.id && user?.accessToken) login(user);
          })
          .catch((err) => {
            toast.error(err.message);
          })
          .finally(() => {
            setWebviewVisible(false);
          });
      } else {
        toast.error(t("failedToLogin"));
        EnjoyApp.view.hide();
      }
    }
  };

  useEffect(() => {
    if (!webviewVisible) return;

    EnjoyApp.view.onViewState((_event, state) => onViewState(state));

    return () => {
      EnjoyApp.view.removeViewStateListeners();
      EnjoyApp.view.remove();
    };
  }, [webApi, webviewVisible]);

  useEffect(() => {
    if (!webviewVisible) return;

    const rect = containerRef.current.getBoundingClientRect();
    EnjoyApp.view.show({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
  }, [webviewVisible]);

  if (user) {
    return (
      <div className="px-4 py-2 border rounded-lg w-full max-w-sm">
        <UserSettings />
        <Separator />
        <LanguageSettings />
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-sm px-6 flex flex-col space-y-4">
        <Button
          variant="secondary"
          size="lg"
          className="w-full h-12 relative"
          onClick={() => handleLogin("github")}
        >
          <img
            src="assets/github-mark.png"
            className="w-8 h-8 absolute left-4"
            alt="github-logo"
          />
          <span className="text-lg">GitHub</span>
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="w-full h-12 relative"
          onClick={() => handleLogin("mixin")}
        >
          <img
            src="assets/mixin-logo.png"
            className="w-8 h-8 absolute left-4"
            alt="mixin-logo"
          />
          <span className="text-lg">Mixin Messenger</span>
        </Button>
      </div>

      <div
        className={`absolute top-0 left-0 w-screen h-screen z-10 flex flex-col overflow-hidden ${
          webviewVisible ? "" : "hidden"
        }`}
      >
        <div className="flex items-center py-2 px-6">
          <Button variant="ghost" onClick={() => setWebviewVisible(false)}>
            <ChevronLeftIcon className="w-5 h-5" />
            <span className="ml-2">{t("goBack")}</span>
          </Button>
        </div>
        <div ref={containerRef} className="w-full flex-1"></div>
      </div>
    </>
  );
};
