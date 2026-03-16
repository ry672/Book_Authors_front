import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginUserMutation, authApi } from "../store/Api/AuthApi";
import { setAuthor } from "../store/Slice/authorSlice";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { InputApp } from "../components/UX/InputApp";
import { ButtonApp } from "../components/UX/ButtonApp";
import { bookApi } from "../store/Api/BookApi";
import { Headers } from "../components/UX/Headers";

const extractEmailRegex = /\S+@\S+\.\S+/g;
const loginSchema = yup.object({
    userEmail: yup
        .string()
        .email("Invalid email format")
        .required("fill in the field")
        .matches(extractEmailRegex, "Invalid email format"),
    userPassword: yup
        .string()
        .min(6, "Minimum 6 characters")
        .required("fill in the field"),
});

type IFormSubmit = yup.InferType<typeof loginSchema>;

export const LoginPage = () => {
    const [loginUser, { data, error, isLoading, isSuccess }] =
        useLoginUserMutation();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<IFormSubmit>({
        resolver: yupResolver(loginSchema),
        mode: "onBlur",
        defaultValues: {
            userEmail: "",
            userPassword: "",
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
        await loginUser({
            email: formData.userEmail,
            password: formData.userPassword,
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
                <Headers headerType="h1" headerText="Authentication" className="text-2xl" />
                <Controller
                    name="userEmail"
                    control={control}
                    render={({ field }) => (
                        <>
                            <InputApp
                                {...field}
                                type="email"
                                placeholder="Your email"
                                className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
                                classId="userEmail"
                                textArea="Email"
                            />
                            {errors.userEmail && (
                                <p className="text-left text-sm text-red-500">
                                    {errors.userEmail.message}
                                </p>
                            )}
                        </>
                    )}
                />

                <Controller
                    name="userPassword"
                    control={control}
                    render={({ field }) => (
                        <>
                            <InputApp
                                {...field}
                                type="password"
                                placeholder="Your password"
                                className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
                                classId="userPassword"
                                textArea="Password"
                            />
                            {errors.userPassword && (
                                <p className="text-left text-sm text-red-500">
                                    {errors.userPassword.message}
                                </p>
                            )}
                        </>
                    )}
                />

                <ButtonApp
                    buttonText={isLoading ? "Loading..." : "Login"}
                    buttonType="submit"
                    disabled={isLoading}
                    className="mx-2 mt-5 w-full rounded-md border bg-white px-2 py-2 text-[14px] font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-5 flex items-center justify-center text-center text-base font-medium text-white">
                    Don't have an account?
                    <Link to="/registration-page" className="ml-2 text-base font-semibold text-blue-500">
                        Register
                    </Link>
                </p>
                {backendMessage && (
                    <p className="text-sm text-red-600">{backendMessage}</p>
                )}

                {error && !backendMessage && (<p className="mt-3 text-red-500">Error logging in</p>)}
            </form>


        </div>
    );
};
