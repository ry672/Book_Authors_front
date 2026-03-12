import { LabelCategories } from "./LabelCategories";
import { ButtonApp } from "./UX/ButtonApp";
import { InputApp } from "./UX/InputApp";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { usePostBookMutation } from "../store/Api/BookApi";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setBook } from "../store/Slice/bookSlice";
import type { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { LabelAuthors } from "./LabelAuthors";

interface SubmitForm {
  name: string;
  price: number;
  description: string;
  link: string;
  authorId: number;
  categoryId: number | null;
}

const httpRegex =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

const schema: yup.ObjectSchema<SubmitForm> = yup.object({
  name: yup.string().trim().min(2, "minimum 2 string").required("Fill"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .min(1, "Min price is 1")
    .required("Fill"),
  description: yup.string().trim().min(20, "minimum 20 string").required("Fill"),
  link: yup.string().trim().matches(httpRegex, "Invalid link it should be https://example.com").required("Fill"),
  authorId: yup.number().required(),
  categoryId: yup
    .number()
    .nullable()
    .typeError("Choose category")
    .required("Choose category"),
});

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;

  // FetchBaseQueryError
  if (typeof error === "object" && error !== null && "status" in error) {
    const e = error as FetchBaseQueryError;

    if (typeof e.data === "object" && e.data !== null && "message" in e.data) {
      const msg = (e.data as any).message;
      return Array.isArray(msg) ? msg.join(", ") : String(msg);
    }

    if (typeof e.data === "string") return e.data;

    return `Request failed (${String(e.status)})`;
  }

  // SerializedError
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as SerializedError).message);
  }

  return "Something went wrong";
}

export const CreateBookAside = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [postBook, { data, isLoading, isSuccess, error }] = usePostBookMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authorIdFromStore = useSelector((s: RootState) => s.author.author?.id);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SubmitForm>({
    defaultValues: {
      name: "",
      price: 1,
      link: "",
      description: "",
      authorId: authorIdFromStore ?? 1,
      categoryId: null,
    },
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setBook(data));
      reset();
      onSuccess?.();
      navigate("/");
    }
  }, [isSuccess, data, dispatch, reset, onSuccess, navigate]);

  const onSubmit: SubmitHandler<SubmitForm> = async (formData) => {
    const categoryId = Number(formData.categoryId);
    if (!categoryId || Number.isNaN(categoryId)) return;

    try {
      await postBook({
        ...formData,
        authorId: authorIdFromStore ?? formData.authorId,
        categoryId,
        price: Number(formData.price),
      }).unwrap();
    } catch (e) {
      console.log("Create book failed:", e);
    }
  };

  const backendErrorText = getErrorMessage(error);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 bg-[#10141C]">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <>
            <InputApp
              {...field}
              className="bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px]  px-2 py-1"
              classId="name"
              placeholder="Clean Code"
              textArea="Name"
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </>
        )}
      />

      <Controller
        name="link"
        control={control}
        render={({ field }) => (
          <>
            <InputApp
              {...field}
              className="bg-gray-900  rounded-md border border-[#2D3748] placeholder:text-[14px]  px-2 py-1"
              classId="link"
              placeholder="https://example.com"
              textArea="Link"
            />
            {errors.link && <p className="text-xs text-red-600">{errors.link.message}</p>}
          </>
        )}
      />

      <Controller
        name="price"
        control={control}
        render={({ field }) => (
          <>
            <InputApp
              {...field}
              className="bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px]  px-2 py-1"
              classId="price"
              placeholder="100"
              textArea="Price"
              onChange={(e: any) => field.onChange(Number(e.target.value))}
            />
            {errors.price && <p className="text-xs text-red-600">{errors.price.message}</p>}
          </>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <>
            <InputApp
              {...field}
              className="bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px]  px-2 py-1"
              classId="description"
              placeholder="Good book about code..."
              textArea="Description"
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </>
        )}
      />
      <LabelAuthors control={control} name="authorId"/>
      {errors.authorId && (
        <p className="text-xs text-red-600">{String(errors.authorId.message)}</p>
      )}


      <LabelCategories control={control} name="categoryId" />
      {errors.categoryId && (
        <p className="text-xs text-red-600">{String(errors.categoryId.message)}</p>
      )}

      <ButtonApp buttonText={isLoading ? "Creating..." : "Create"} buttonType="submit" className="brounded-md border bg-white px-2 py-2 text-[14px] text-black font-semibold w-full rounded-md mx-2 mt-60"/>

     
      {backendErrorText && (
        <div className="rounded-md border bg-white px-3 py-2 text-[12px] text-black">
          {backendErrorText}
        </div>
      )}
    </form>
  );
};