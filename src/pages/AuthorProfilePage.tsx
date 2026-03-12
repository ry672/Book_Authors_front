import { useNavigate, useParams } from "react-router-dom";
import { useGetAuthorByIdQuery } from "../store/Api/AuthorApi";
import defaultAvatar from "../images/icons8-user-default-64.png";

export const ProfileAuthorPage = () => {
  const { id } = useParams();
  const authorId = Number(id);
  const navigate = useNavigate();

  const { data: author, isLoading, error } = useGetAuthorByIdQuery(authorId, {
    skip: !id || Number.isNaN(authorId),
  });

  const bookPageClick = (id: number) => {
    navigate(`/book-profile-page/${id}`);
  };

  const getAuthorImageUrl = (photo?: string | null) => {
    if (!photo?.trim()) return defaultAvatar;

    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }

    const baseUrl = import.meta.env.VITE_SERVER_URL?.replace(/\/$/, "") ?? "";
    const normalizedPhoto = photo.startsWith("/") ? photo : `/${photo}`;

    return `${baseUrl}${normalizedPhoto}`;
  };

  if (!id || Number.isNaN(authorId)) {
    return <div>Invalid author id</div>;
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  if (!author) return <div>Author not found</div>;

  const books = author.books ?? [];

  return (
    <div className="my-auto flex w-full flex-col justify-center gap-2 py-6">
      <img
        src={getAuthorImageUrl(author.author_photo)}
        alt={author.name}
        className="h-24 w-24 rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.src = defaultAvatar;
        }}
      />

      <h1 className="text-lg font-semibold">{author.name}</h1>
      <h2 className="text-lg font-semibold">{author.full_name}</h2>
      <p className="text-lg font-semibold">{author.country ?? "-"}</p>
      <p className="text-lg font-semibold">{author.description ?? "-"}</p>

      <h2 className="chelsea-market-regular mt-5 text-xl font-bold text-[#117278]">
        Books
      </h2>

      {books.length === 0 ? (
        <div>No books yet</div>
      ) : (
        books.map((b) => (
          <div
            key={b.id}
            onClick={() => bookPageClick(b.id)}
            className="cursor-pointer"
          >
            {b.name}
          </div>
        ))
      )}
    </div>
  );
};
