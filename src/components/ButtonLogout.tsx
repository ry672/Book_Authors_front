import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAuthor } from "../store/Slice/authorSlice";
import { useLogoutUserMutation, authApi } from "../store/Api/AuthApi";
import { authorApi } from "../store/Api/AuthorApi";
import { bookApi } from "../store/Api/BookApi";
import { categoryApi } from "../store/Api/CategoryApi";
import imageLogOut from "../images/log-out (1).svg";

export const LogoutButton = ({ isOpen = false }: { isOpen?: boolean }) => {
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
      aria-pressed={isOpen}
      className={`flex w-full items-center justify-center gap-2  px-3 py-2 text-[13px] font-semibold text-white transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#117278]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10141C]
        ${
          isOpen
            ? "border-[#117278] bg-gray-800 shadow-[0_0_0_2px_rgba(17,114,120,0.25)]"
            : "border-[#2D3748] bg-gray-900 hover:bg-gray-800"
        }
        disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <img src={imageLogOut} alt="Logout" className="h-4 w-4" />
      <span>{isLoading ? "Logging out..." : "Logout"}</span>
    </button>
  );
};