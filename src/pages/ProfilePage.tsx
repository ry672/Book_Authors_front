import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { useGetAuthorByIdQuery } from "../store/Api/AuthorApi";

export const AuthorProfilePage = () => {
  const { id } = useParams();
  const authorId = Number(id);


  const authorFromStore = useSelector(
    (state: RootState) => state.author.byId?.[authorId]
  );

  const { data, isLoading } = useGetAuthorByIdQuery(authorId, {
    skip: !!authorFromStore,
  });

  const author = authorFromStore ?? data;

  if (!author && isLoading) return <div>Loading...</div>;
  if (!author) return <div>Author not found</div>;

  return (
    <div>
      <h1>{author.name}</h1>
      <p>{author.full_name}</p>
      <p>{author.description}</p>
    </div>
  );
};