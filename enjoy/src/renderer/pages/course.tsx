import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  toast,
} from "@renderer/components/ui";
import { Link, useNavigate, useParams } from "react-router-dom";
import { t } from "i18next";
import { useContext, useEffect, useState } from "react";
import { AppSettingsProviderContext } from "@renderer/context";

export default () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { webApi } = useContext(AppSettingsProviderContext);
  const [course, setCourse] = useState<CourseType | null>(null);

  const fetchCourse = async (id: string) => {
    webApi
      .course(id)
      .then((course) => setCourse(course))
      .catch((err) => toast.error(err.message));
  };

  useEffect(() => {
    fetchCourse(id);
  }, [id]);

  return (
    <div className="h-full max-w-5xl mx-auto px-4 py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/courses">{t("sidebar.courses")}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{course?.title || id}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
