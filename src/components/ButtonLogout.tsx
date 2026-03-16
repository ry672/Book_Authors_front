import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAuthor } from "../store/Slice/authorSlice";
import { useLogoutUserMutation, authApi } from "../store/Api/AuthApi";
import { authorApi } from "../store/Api/AuthorApi";
import { bookApi } from "../store/Api/BookApi";
import { categoryApi } from "../store/Api/CategoryApi";

export const LogoutButton = () => {
  const [logoutUser, { isLoading }] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch (error) {
      console.log("Logout request failed", error);
    } finally {
      dispatch(clearAuthor());
      dispatch(authApi.util.resetApiState());
      dispatch(authorApi.util.resetApiState());
      dispatch(bookApi.util.resetApiState());
      dispatch(categoryApi.util.resetApiState());

      navigate("/", { replace: true });
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-md border bg-white px-3 py-2 text-[13px] font-semibold text-black"
    >
      {isLoading ? "Loading..." : "Logout"}
    </button>
  );
};