import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useRegisterUserMutation, authApi } from "../store/Api/AuthApi";
import { setAuthor } from "../store/Slice/authorSlice";
import { bookApi } from "../store/Api/BookApi";
import { InputApp } from "../components/UX/InputApp";
import { ButtonApp } from "../components/UX/ButtonApp";
import { Headers } from "../components/UX/Headers";

const extractEmailRegex = /\S+@\S+\.\S+/g;
const registerSchema = yup.object({
  authorPassword: yup
    .string()
    .min(6, "Minimum 6 characters")
    .required("fill in the field"),
  authorName: yup
    .string()
    .trim()
    .min(2, "Minimum 2 characters")
    .required("fill in the field"),
  authorEmail: yup
    .string()
    .trim()
    .email("Invalid email format")
    .matches(extractEmailRegex, "Invalid email format")
    .required("fill in the field"),
  authorCity: yup
    .string()
    .trim()
    .min(2, "Minimum 2 characters")
    .required("fill in the field"),
  authorFull_name: yup
    .string()
    .trim()
    .min(2, "Minimum 2 characters")
    .required("fill in the field"),
  authorDescription: yup.string().trim().default(""),
});

type IFormSubmit = yup.InferType<typeof registerSchema>;

export const RegistrationPage = () => {
  const [registerUser, { data, isLoading, error, isSuccess }] =
    useRegisterUserMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormSubmit>({
    resolver: yupResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      authorPassword: "",
      authorName: "",
      authorEmail: "",
      authorCity: "",
      authorFull_name: "",
      authorDescription: "",
    },
  });

  useEffect(() => {
    if (
      isSuccess &&
      data?.author &&
      data?.accessToken &&
      data?.refreshToken
    ) {
      dispatch(
        setAuthor({
          author: {
            ...data.author,
            books: [],
          },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );

      dispatch(authApi.util.resetApiState());
      dispatch(bookApi.util.resetApiState());

      navigate("/books-page");
    }
  }, [data, isSuccess, dispatch, navigate]);

  const onSubmit: SubmitHandler<IFormSubmit> = async (formData) => {
    await registerUser({
      name: formData.authorName,
      full_name: formData.authorFull_name,
      description: formData.authorDescription,
      country: formData.authorCity,
      email: formData.authorEmail,
      password: formData.authorPassword,
    });
  };

  const backendMessage =
    error && typeof error === "object" && error !== null && "data" in error
      ? Array.isArray(
        (error as { data?: { message?: string | string[] } }).data?.message
      )
        ? (
          error as { data?: { message?: string[] } }
        ).data?.message?.join(", ")
        : String(
          (error as { data?: { message?: string } }).data?.message ?? ""
        )
      : null;

  return (
    <div className="min-h-screen flex text-slate-100 items-center justify-center"
      style={{ backgroundColor: "#10141C" }}>
      <form onSubmit={handleSubmit(onSubmit)} className=" w-[420px] border border-[#2D3748]   bg-[#10141C] p-6 shadow-sm rounded-md p-4 flex flex-col gap-4">
        <Headers headerType="h1" headerText="Registration" className="text-2xl" />
        <Controller
          name="authorName"
          control={control}
          render={({ field }) => (
            <>
              <InputApp
                {...field}
                type="text"
                placeholder="Your name"
                className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
                classId="authorName"
                textArea="Name"
              />
              {errors.authorName && (
                <p className="text-red-500 text-sm text-left">
                  {errors.authorName.message}
                </p>
              )}
            </>
          )}
        />

        <Controller
          name="authorFull_name"
          control={control}
          render={({ field }) => (
            <>
              <InputApp
                {...field}
                type="text"
                placeholder="Your full name"
                className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
                classId="authorFull_name"
                textArea="Full name"
              />
              {errors.authorFull_name && (
                <p className="text-red-500 text-sm text-left">
                  {errors.authorFull_name.message}
                </p>
              )}
            </>
          )}
        />

        <Controller
          name="authorEmail"
          control={control}
          render={({ field }) => (
            <>
              <InputApp
                {...field}
                type="email"
                placeholder="Your email"
                className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
                classId="authorEmail"
                textArea="Email"
              />
              {errors.authorEmail && (
                <p className="text-red-500 text-sm text-left">
                  {errors.authorEmail.message}
                </p>
              )}
            </>
          )}
        />

        <Controller
          name="authorPassword"
          control={control}
          render={({ field }) => (
            <>
              <InputApp
                {...field}
                type="password"
                placeholder="Your password"
                className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
                classId="authorPassword"
                textArea="Password"
              />
              {errors.authorPassword && (
                <p className="text-red-500 text-sm text-left">
                  {errors.authorPassword.message}
                </p>
              )}
            </>
          )}
        />

        <Controller
          name="authorCity"
          control={control}
          render={({ field }) => (
            <>
              <InputApp
                {...field}
                type="text"
                placeholder="Your country or city"
                className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
                classId="authorCity"
                textArea="Country"
              />
              {errors.authorCity && (
                <p className="text-red-500 text-sm text-left">
                  {errors.authorCity.message}
                </p>
              )}
            </>
          )}
        />

        <Controller
          name="authorDescription"
          control={control}
          render={({ field }) => (
            <>
              <InputApp
                {...field}
                value={field.value ?? ""}
                type="text"
                placeholder="Your description"
                className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
                classId="authorDescription"
                textArea="Description"
              />
              {errors.authorDescription && (
                <p className="text-red-500 text-sm text-left">
                  {errors.authorDescription.message}
                </p>
              )}
            </>
          )}
        />

        <ButtonApp
          buttonText={isLoading ? "Loading..." : "Register"}
          buttonType="submit"
          disabled={isLoading}
          className="mx-2 mt-5 w-full rounded-md border bg-white px-2 py-2 text-[14px] font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
        />

        {error && (
          <p className="text-red-500 text-sm">Error registering</p>
        )}

        <p className="flex justify-center items-center mt-5 text-white font-medium text-base text-center">
          Already have an account?
          <Link to="/" className="ml-2 text-blue-500 font-semibold text-base">
            Login
          </Link>
        </p>
        {backendMessage && (
          <p className="text-sm text-red-600">{backendMessage}</p>
        )}
        {error && !backendMessage && (<p className="text-sm text-red-600">Error registering</p>)}
      </form>


    </div>
  );
};