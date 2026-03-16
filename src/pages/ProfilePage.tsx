import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { useGetAuthorByIdQuery } from "../store/Api/AuthorApi";
import defaultAvatar from "../images/icons8-user-default-64.png";

const getAuthorImageUrl = (photo?: string | null) => {
  if (!photo?.trim()) {
    return defaultAvatar;
  }

  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  const baseUrl = import.meta.env.VITE_SERVER_URL?.replace(/\/$/, "") ?? "";
  const normalizedPhoto = photo.startsWith("/") ? photo : `/${photo}`;

  return `${baseUrl}${normalizedPhoto}`;
};

export const ProfilePage = () => {
  const authorId = useSelector((state: RootState) => state.author.author?.id);

  const {
    data: author,
    isLoading,
    isError,
  } = useGetAuthorByIdQuery(authorId ?? 0, {
    skip: !authorId,
  });

  if (!authorId) {
    return <div className="p-4 text-white">Author id not found</div>;
  }

  if (isLoading) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  if (isError || !author) {
    return <div className="p-4 text-white">Profile not found</div>;
  }

  return (
    <div className="space-y-4 p-4 text-white">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <div className="rounded-md bg-[#10141C] p-4">
        <div className="mb-4">
          <img
            src={getAuthorImageUrl(author.author_photo)}
            alt={author.name}
            className="h-24 w-24 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = defaultAvatar;
            }}
          />
        </div>

        <div className="space-y-2">
          <p>
            <span className="font-semibold">Name:</span> {author.name}
          </p>
          <p>
            <span className="font-semibold">Full name:</span> {author.full_name}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {author.email ?? "—"}
          </p>
          <p>
            <span className="font-semibold">Country:</span> {author.country ?? "—"}
          </p>
          <p>
            <span className="font-semibold">Description:</span>{" "}
            {author.description ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
};