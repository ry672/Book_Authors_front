import { useNavigate, useParams } from "react-router-dom";
import { useGetBookByIdQuery } from "../store/Api/BookApi";

const SERVER_URL =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ||
  (import.meta.env.VITE_EXCHANGE_API_BASE_URL as string | undefined) ||
  "";

function getBookPhotoUrl(photo?: string): string {
  if (!photo) return "";

  const normalized = photo.replace(/^https(?=\/\/)/, "https:");

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    return normalized;
  }

  const base = SERVER_URL.replace(/\/+$/, "");
  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;

  return `${base}${path}`;
}

export const BookProfilePage = () => {
  const { id } = useParams();
  const bookId = Number(id);
  const navigate = useNavigate();

  const {
    data: book,
    isLoading,
    isError,
  } = useGetBookByIdQuery(bookId, {
    skip: !id || Number.isNaN(bookId),
  });

  const authorPageClick = (authorId: number) => {
    navigate(`/profile-author-page/${authorId}`);
  };

  if (isLoading) {
    return <div className="px-4 py-6 text-white">Loading...</div>;
  }

  if (isError || !book) {
    return <div className="px-4 py-6 text-white">Book not found</div>;
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">{book.name}</h1>

        <div className="text-base font-medium text-white">
          {book.description}
        </div>

        <div className="text-base font-semibold text-white">
          <span className="mr-2">Price:</span>
          <span>{book.price}$</span>
        </div>

        <div className="text-base font-semibold text-white">
          <span className="mr-2">Link:</span>
          <a
            href={book.link}
            target="_blank"
            rel="noreferrer"
            className="break-all text-[#117278] underline"
          >
            {book.link}
          </a>
        </div>
      </div>

      <div>
        <h3 className="mt-2 text-xl font-bold text-[#117278]">
          Photos
        </h3>

        {book.photos && book.photos.length > 0 ? (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {book.photos.map((photo, index) => (
              <div
                key={`${photo}-${index}`}
                className="overflow-hidden rounded-md border border-[#2D3748] bg-[#10141C]"
              >
                <img
                  src={getBookPhotoUrl(photo)}
                  alt={`${book.name} photo ${index + 1}`}
                  className="h-64 w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-sm text-gray-300">No photos</div>
        )}
      </div>

      <div
        onClick={() => authorPageClick(book.authorId)}
        className="cursor-pointer rounded-md border border-[#2D3748] bg-[#10141C] p-4"
      >
        <h3 className="text-xl font-bold text-[#117278]">Author</h3>

        <div className="mt-2 flex flex-col gap-1 text-white">
          <span className="text-lg font-semibold">{book.author.name}</span>
          <span className="text-base font-medium">{book.author.full_name}</span>
        </div>
      </div>

      <div className="rounded-md border border-[#2D3748] bg-[#10141C] p-4">
        <h3 className="text-xl font-bold text-[#117278]">Category</h3>
        <div className="mt-2 text-lg font-semibold text-white">
          {book.category.name}
        </div>
      </div>
    </div>
  );
};