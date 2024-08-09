import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  ScrollArea,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
  Separator,
  DialogTitle,
} from "@renderer/components/ui";
import {
  SettingsIcon,
  HomeIcon,
  HeadphonesIcon,
  VideoIcon,
  NewspaperIcon,
  BookMarkedIcon,
  UserIcon,
  BotIcon,
  UsersRoundIcon,
  LucideIcon,
  HelpCircleIcon,
  ExternalLinkIcon,
  NotebookPenIcon,
  SpeechIcon,
  GraduationCapIcon,
  MessagesSquareIcon,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { t } from "i18next";
import { Preferences } from "@renderer/components";
import { AppSettingsProviderContext } from "@renderer/context";
import { useContext, useEffect } from "react";
import { NoticiationsChannel } from "@/renderer/cables";

export const Sidebar = () => {
  const location = useLocation();
  const activeTab = location.pathname;
  const { EnjoyApp, cable } = useContext(AppSettingsProviderContext);

  useEffect(() => {
    const channel = new NoticiationsChannel(cable);
    channel.subscribe();
  }, []);

  return (
    <div
      className="h-[100vh] w-16 xl:w-40 transition-all relative"
      data-testid="sidebar"
    >
      <div className="fixed top-0 left-0 h-full w-16 xl:w-40 bg-muted">
        <ScrollArea className="w-full h-full pb-12">
          <div className="py-4 mb-4 flex items-center space-x-1 justify-center">
            <img src="./assets/logo-light.svg" className="w-8 h-8" />
            <span className="hidden xl:block text-xl font-semibold text-[#4797F5]">
              ENJOY
            </span>
          </div>
          <div className="grid gap-2">
            <SidebarItem
              href="/"
              label={t("sidebar.home")}
              tooltip={t("sidebar.home")}
              active={activeTab === "/"}
              Icon={HomeIcon}
            />

            <SidebarItem
              href="/chats"
              label={t("sidebar.chats")}
              tooltip={t("sidebar.chats")}
              active={activeTab.startsWith("/chats")}
              Icon={MessagesSquareIcon}
            />

            <SidebarItem
              href="/courses"
              label={t("sidebar.courses")}
              tooltip={t("sidebar.courses")}
              active={activeTab.startsWith("/courses")}
              Icon={GraduationCapIcon}
            />

            <Separator className="hidden xl:block" />

            <SidebarItem
              href="/audios"
              label={t("sidebar.audios")}
              tooltip={t("sidebar.audios")}
              active={activeTab.startsWith("/audios")}
              Icon={HeadphonesIcon}
            />

            <SidebarItem
              href="/videos"
              label={t("sidebar.videos")}
              tooltip={t("sidebar.videos")}
              active={activeTab.startsWith("/videos")}
              Icon={VideoIcon}
            />

            <SidebarItem
              href="/stories"
              label={t("sidebar.stories")}
              tooltip={t("sidebar.stories")}
              active={activeTab.startsWith("/stories")}
              Icon={NewspaperIcon}
            />

            <Separator className="hidden xl:block" />

            <SidebarItem
              href="/conversations"
              label={t("sidebar.aiAssistant")}
              tooltip={t("sidebar.aiAssistant")}
              active={activeTab.startsWith("/conversations")}
              Icon={BotIcon}
              testid="sidebar-conversations"
            />

            <SidebarItem
              href="/pronunciation_assessments"
              label={t("sidebar.pronunciationAssessment")}
              tooltip={t("sidebar.pronunciationAssessment")}
              active={activeTab.startsWith("/pronunciation_assessments")}
              Icon={SpeechIcon}
              testid="sidebar-pronunciation-assessments"
            />

            <SidebarItem
              href="/notes"
              label={t("sidebar.notes")}
              tooltip={t("sidebar.notes")}
              active={activeTab === "/notes"}
              Icon={NotebookPenIcon}
            />

            <SidebarItem
              href="/vocabulary"
              label={t("sidebar.vocabulary")}
              tooltip={t("sidebar.vocabulary")}
              active={activeTab.startsWith("/vocabulary")}
              Icon={BookMarkedIcon}
            />

            <Separator className="hidden xl:block" />

            <SidebarItem
              href="/community"
              label={t("sidebar.community")}
              tooltip={t("sidebar.community")}
              active={activeTab === "/community"}
              Icon={UsersRoundIcon}
            />

            <SidebarItem
              href="/profile"
              label={t("sidebar.profile")}
              tooltip={t("sidebar.profile")}
              active={activeTab.startsWith("/profile")}
              Icon={UserIcon}
            />

            <Separator className="hidden xl:block" />

            <Dialog>
              <DialogTrigger asChild>
                <div className="px-1 xl:px-2">
                  <Button
                    variant="ghost"
                    id="preferences-button"
                    className="w-full xl:justify-start"
                    data-tooltip-id="global-tooltip"
                    data-tooltip-content={t("sidebar.preferences")}
                    data-tooltip-place="right"
                  >
                    <SettingsIcon className="xl:mr-2 h-5 w-5" />
                    <span className="hidden xl:block">
                      {t("sidebar.preferences")}
                    </span>
                  </Button>
                </div>
              </DialogTrigger>

              <DialogContent className="max-w-screen-md xl:max-w-screen-lg h-5/6 p-0">
                <DialogTitle className="hidden">
                  {t("sidebar.preferences")}
                </DialogTitle>
                <Preferences />
              </DialogContent>
            </Dialog>
          </div>
        </ScrollArea>

        <div className="w-full absolute bottom-0 px-1 xl:px-4 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full xl:justify-start px-2 xl:px-4"
              >
                <HelpCircleIcon className="h-5 w-5" />
                <span className="ml-2 hidden xl:block">
                  {t("sidebar.help")}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="px-4">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    EnjoyApp.shell.openExternal("https://1000h.org/enjoy-app/")
                  }
                  className="flex justify-between space-x-2"
                >
                  <span>{t("userGuide")}</span>
                  <ExternalLinkIcon className="h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {t("feedback")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() =>
                          EnjoyApp.shell.openExternal(
                            "https://mixin.one/codes/f8ff96b8-54fb-4ad8-a6d4-5a5bdb1df13e"
                          )
                        }
                        className="flex justify-between space-x-2"
                      >
                        <span>Mixin</span>
                        <ExternalLinkIcon className="h-4 w-4" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          EnjoyApp.shell.openExternal(
                            "https://github.com/zuodaotech/everyone-can-use-english/discussions"
                          )
                        }
                        className="flex justify-between space-x-2"
                      >
                        <span>Github</span>
                        <ExternalLinkIcon className="h-4 w-4" />
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = (props: {
  href: string;
  label: string;
  tooltip: string;
  active: boolean;
  Icon: LucideIcon;
  testid?: string;
}) => {
  const { href, label, tooltip, active, Icon, testid } = props;

  return (
    <Link
      to={href}
      data-tooltip-id="global-tooltip"
      data-tooltip-content={tooltip}
      data-tooltip-place="right"
      data-testid={testid}
      className="block px-1 xl:px-2"
    >
      <Button
        variant={active ? "default" : "ghost"}
        className="w-full xl:justify-start px-2 xl:px-4"
      >
        <Icon className="h-5 w-5" />
        <span className="ml-2 hidden xl:block">{label}</span>
      </Button>
    </Link>
  );
};
