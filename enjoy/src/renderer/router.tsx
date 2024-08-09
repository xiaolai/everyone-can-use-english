import { createHashRouter } from "react-router-dom";
import { Layout } from "@renderer/components";
import Conversations from "./pages/conversations";
import Conversation from "./pages/conversation";
import Vocabulary from "./pages/vocabulary";
import ErrorPage from "./pages/error-page";
import Landing from "./pages/landing";
import Audio from "./pages/audio";
import Video from "./pages/video";
import Audios from "./pages/audios";
import Videos from "./pages/videos";
import Stories from "./pages/stories";
import Story from "./pages/story";
import Books from "./pages/books";
import Profile from "./pages/profile";
import User from "./pages/user";
import Home from "./pages/home";
import Community from "./pages/community";
import StoryPreview from "./pages/story-preview";
import Notes from "./pages/notes";
import PronunciationAssessmentsIndex from "./pages/pronunciation-assessments/index";
import PronunciationAssessmentsNew from "./pages/pronunciation-assessments/new";
import Courses from "./pages/courses/index";
import Course from "./pages/courses/show";
import Chapter from "./pages/courses/chapter";
import Chats from "./pages/chats";

export default createHashRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "/chats",
        element: <Chats />,
      },
      {
        path: "/courses",
        element: <Courses />,
      },
      {
        path: "/courses/:id",
        element: <Course />,
      },
      {
        path: "/courses/:id/chapters/:sequence",
        element: <Chapter />,
      },
      {
        path: "/community",
        element: <Community />,
      },
      {
        path: "/users/:id",
        element: <User />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/conversations",
        element: <Conversations />,
      },
      {
        path: "/conversations/:id",
        element: <Conversation />,
      },
      {
        path: "/pronunciation_assessments",
        element: <PronunciationAssessmentsIndex />,
      },
      {
        path: "/pronunciation_assessments/new",
        element: <PronunciationAssessmentsNew />,
      },
      {
        path: "/vocabulary",
        element: <Vocabulary />,
      },
      {
        path: "/audios",
        element: <Audios />,
      },
      {
        path: "/audios/:id",
        element: <Audio />,
      },
      {
        path: "/videos",
        element: <Videos />,
      },
      {
        path: "/videos/:id",
        element: <Video />,
      },
      {
        path: "/stories",
        element: <Stories />,
      },
      {
        path: "/stories/:id",
        element: <Story />,
      },
      {
        path: "/books",
        element: <Books />,
      },
      {
        path: "/stories/preview/:uri",
        element: <StoryPreview />,
      },
      {
        path: "/notes",
        element: <Notes />,
      },
    ],
  },
  { path: "/landing", element: <Landing /> },
]);
