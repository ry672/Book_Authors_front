import { useEffect } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useGetBookByIdQuery, usePatchBookMutation } from "../store/Api/BookApi";
import { InputApp } from "./UX/InputApp";
import { ButtonApp } from "./UX/ButtonApp";
import { LabelCategories } from "./LabelCategories";
import { LabelAuthors } from "./LabelAuthors";

type FormValues = {
  name: string;
  link: string;
  price: number;
  description: string;
  categoryId: number | null;
  authorId: number | null;
}

const httpRegex =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

const schema: yup.ObjectSchema<FormValues> = yup.object({
  name: yup.string().trim().min(2, "minimum 2 string").required("Fill"),
  link: yup
    .string()
    .trim()
    .matches(httpRegex, "Invalid link it should be https://example.com")
    .required("Fill"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .min(1, "Min price is 1")
    .required("Fill"),
  description: yup.string().trim().min(20, "minimum 20 string").required("Fill"),


  categoryId: yup
    .number()
    .nullable()
    .defined() 
    .typeError("Choose category"),

  authorId: yup
     .number()
    .nullable()
    .defined() 
    .typeError("Choose author"),

});

export const UpdateBookAside = ({
  id,
  onSuccess,
}: {
  id: number;
  onSuccess?: () => void;
}) => {
  const { data: book, isLoading: isBookLoading, isError } =
    useGetBookByIdQuery(id);

  const [patchBook, { isLoading: isSaving, error: saveError }] =
    usePatchBookMutation();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      link: "",
      price: 1,
      description: "",
      categoryId: null,
    },
    resolver: yupResolver(schema) as any, 
    mode: "onBlur",
  });

  useEffect(() => {
    if (!book) return;
    reset({
      name: book.name ?? "",
      link: book.link ?? "",
      price: book.price ?? 1,
      description: book.description ?? "",
      categoryId: book.categoryId ?? null,
      authorId: book.authorId ?? null,
    });
  }, [book, reset]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      await patchBook({
        id,
        data: {
          name: values.name,
          link: values.link,
          price: Number(values.price),
          description: values.description,
          categoryId: values.categoryId ?? undefined,
          authorId: values.authorId ?? undefined,
        },
      }).unwrap();

      onSuccess?.();
    } catch (e) {
      console.log("Update book failed:", e);
    }
  };

  const backendMessage =
    saveError &&
    typeof saveError === "object" &&
    saveError !== null &&
    "data" in saveError
      ? (saveError as any).data?.message
      : null;

  if (isBookLoading) return <div>Loading...</div>;
  if (isError || !book) return <div>Book not found</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <>
            <InputApp {...field} className="bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px] px-2 py-1" classId="name" placeholder="Clean Code" textArea="Name" />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </>
        )}
      />

      <Controller
        name="link"
        control={control}
        render={({ field }) => (
          <>
            <InputApp {...field} className="bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px] px-2 py-1" classId="link" placeholder="https://example.com" textArea="Link" />
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
              className="bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px] px-2 py-1"
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
            <InputApp {...field} className="bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px] px-2 py-1" classId="description" placeholder="About book..." textArea="Description" />
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

      {backendMessage && (
        <p className="text-xs text-red-600">{String(backendMessage)}</p>
      )}

      <ButtonApp buttonText={isSaving ? "Saving..." : "Update"} buttonType="submit" className="brounded-md border bg-white px-2 py-2 text-[14px] text-black font-semibold w-full rounded-md mx-2 mt-60"/>
    </form>
  );
};