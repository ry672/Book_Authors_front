import { useNavigate, useParams } from "react-router-dom";
import { useGetBookByIdQuery } from "../store/Api/BookApi";

export const BookProfilePage = () => {
  const { id } = useParams();
  const bookId = Number(id);
  const navigate = useNavigate()

  const { data: book} = useGetBookByIdQuery(bookId, {
    skip: !id || Number.isNaN(bookId),
  });
  const authorPageClick = (id: number) => {
    navigate(`/profile-author-page/${id}`);
  };

  if (!book) return <div>Book not found</div>;

  return (
    <>
      <div className="w-full my-auto py-6 flex flex-col justify-center gap-2">
        <h1 className="text-lg font-semibold">{book.name}</h1>
        <div className="text-lg font-semibold">{book.description}</div>
        <div className="text-lg font-semibold"><span>Price:</span><span>{book.price}</span></div>
      </div>

      <div onClick={()=>authorPageClick(book.authorId)}>
        <h3 className="text-xl sm:text-xl md:text-xl chelsea-market-regular font-bold text-[#117278] mt-5">Author</h3>
      
        <span className="text-lg font-semibold">{book.author.name}</span>
        <span className="text-lg font-semibold">{book.author.full_name}</span>
      </div>
      

      <h3 className="text-xl sm:text-xl md:text-xl chelsea-market-regular font-bold text-[#117278] mt-5">Category</h3>
      <div className="text-lg font-semibold">{book.category.name}</div>
    </>
  );
};