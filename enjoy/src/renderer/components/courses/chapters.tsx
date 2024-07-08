import { AppSettingsProviderContext } from "@renderer/context";
import { useContext, useEffect, useState } from "react";
import { ChapterCard } from "@renderer/components";
import {
  Input,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@renderer/components/ui";

export const Chapters = (props: { course: CourseType }) => {
  const { course } = props;
  const { webApi } = useContext(AppSettingsProviderContext);
  const [chapters, setChapters] = useState<ChapterType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>();
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchCourseChapters = async (params?: { page: number }) => {
    if (!course?.id) return;

    let { page } = params || {};
    if (!page && course.enrollment?.currentChapterSequence) {
      page = Math.ceil(course.enrollment.currentChapterSequence / 20);
    }
    page = page || currentPage;

    webApi
      .courseChapters(course.id, { page, items: 30 })
      .then(({ chapters, page, next, last }) => {
        setCurrentPage(page);
        setLastPage(last);
        setHasMore(!!next);
        setChapters(chapters);
      });
  };

  useEffect(() => {
    if (!course) return;
    fetchCourseChapters();
  }, [course]);

  if (!course) return null;
  if (!chapters) return null;

  return (
    <div className="">
      <div className="grid gap-4 grid-cols-5 mb-4">
        {chapters.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            active={course.enrollment?.currentChapterId === chapter.id}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              {currentPage > 1 && (
                <PaginationPrevious
                  onClick={() => fetchCourseChapters({ page: currentPage - 1 })}
                />
              )}
            </PaginationItem>
            <PaginationItem>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="w-16 text-center"
                  value={currentPage}
                  onChange={(e) => {
                    setCurrentPage(parseInt(e.target.value));
                    fetchCourseChapters({ page: parseInt(e.target.value) });
                  }}
                />
                /<span>{lastPage}</span>
              </div>
            </PaginationItem>
            <PaginationItem>
              {hasMore && (
                <PaginationNext
                  onClick={() => fetchCourseChapters({ page: currentPage + 1 })}
                />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
