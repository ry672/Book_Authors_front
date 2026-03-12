import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { InputApp } from "./UX/InputApp";
import { ButtonApp } from "./UX/ButtonApp";
import { usePostCategoryMutation } from "../store/Api/CategoryApi";
import { setCategory } from "../store/Slice/categorySlice";
import * as yup from "yup";
import { bookApi } from "../store/Api/BookApi";

type SubmitForm = {
  name: string;
};

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "minimum 2 string")
    .max(20, "maximum 20 characters")
    .required("Fill"),
});

export const CreateCategoryAside = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const [postCategory, { isLoading, error }] = usePostCategoryMutation();
  const dispatch = useDispatch();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SubmitForm>({
    defaultValues: { name: "" },
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const backendMessage =
    error && typeof error === "object" && error !== null && "data" in error
      ? (error as any).data?.message
      : null;

  const onSubmit: SubmitHandler<SubmitForm> = async (formData) => {
    try {
      const created = await postCategory(formData).unwrap();

      dispatch(setCategory(created));

      dispatch(bookApi.util.invalidateTags([{ type: "Books", id: "LIST" }]));

      reset();
      onSuccess?.();
    } catch (e) {
      console.log("Create category failed:", e);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <>
            <InputApp
              {...field}
              className="bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px]  px-2 py-1"
              classId="name"
              placeholder="Fantasy"
              textArea="Category name"
            />

 
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}

            {backendMessage && (
              <p className="text-xs text-red-600">{String(backendMessage)}</p>
            )}
          </>
        )}
      />

      <ButtonApp
        buttonText={isLoading ? "Creating..." : "Create"}
        buttonType="submit"
        className="brounded-md border bg-white px-2 py-2 text-[14px] text-black font-semibold w-full rounded-md mx-2 mt-130"
      />
    </form>
  );
};