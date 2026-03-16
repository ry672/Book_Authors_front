import { LabelCategories } from "./LabelCategories";
import { ButtonApp } from "./UX/ButtonApp";
import { InputApp } from "./UX/InputApp";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { usePostBookMutation } from "../store/Api/BookApi";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
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

type SelectedPhoto = {
  id: string;
  file: File;
  preview: string;
};

const MAX_FILES = 10;
const MIN_FILES = 1;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const httpRegex =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

const schema: yup.ObjectSchema<SubmitForm> = yup.object({
  name: yup.string().trim().min(2, "minimum 2 string").required("Fill"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .min(1, "Min price is 1")
    .required("Fill"),
  description: yup
    .string()
    .trim()
    .min(20, "minimum 20 string")
    .required("Fill"),
  link: yup
    .string()
    .trim()
    .matches(httpRegex, "Invalid link it should be https://example.com")
    .required("Fill"),
  authorId: yup.number().typeError("Choose author").required("Choose author"),
  categoryId: yup
    .number()
    .nullable()
    .typeError("Choose category")
    .required("Choose category"),
});

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (typeof error === "object" && error !== null && "status" in error) {
    const e = error as FetchBaseQueryError;

    if (typeof e.data === "object" && e.data !== null && "message" in e.data) {
      const msg = (e.data as { message?: string | string[] }).message;
      return Array.isArray(msg) ? msg.join(", ") : String(msg);
    }

    if (typeof e.data === "string") return e.data;

    return `Request failed (${String(e.status)})`;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as SerializedError).message);
  }

  return "Something went wrong";
}

export const CreateBookAside = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const [postBook, { data, isLoading, isSuccess, error }] =
    usePostBookMutation();

  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [photosError, setPhotosError] = useState<string>("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authorIdFromStore = useSelector(
    (s: RootState) => s.author.author?.id
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));

      setPhotos([]);
      setPhotosError("");

      reset({
        name: "",
        price: 1,
        link: "",
        description: "",
        authorId: authorIdFromStore ?? 1,
        categoryId: null,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onSuccess?.();
      navigate("/books-page");
    }
  }, [
    isSuccess,
    data,
    dispatch,
    reset,
    onSuccess,
    navigate,
    authorIdFromStore,
    photos,
  ]);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [photos]);

  const validateFiles = (incomingFiles: File[], currentCount: number) => {
    const errorsList: string[] = [];
    const validFiles: File[] = [];

    if (currentCount + incomingFiles.length > MAX_FILES) {
      errorsList.push(`You can upload maximum ${MAX_FILES} photos`);
      return { validFiles, errorText: errorsList.join(", ") };
    }

    for (const file of incomingFiles) {
      if (!file.type.startsWith("image/")) {
        errorsList.push(`${file.name}: file must be an image`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        errorsList.push(`${file.name}: max size is ${MAX_FILE_SIZE_MB} MB`);
        continue;
      }

      validFiles.push(file);
    }

    return { validFiles, errorText: errorsList.join(", ") };
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;

    const selectedFiles = Array.from(e.target.files ?? []);
    if (!selectedFiles.length) return;

    const { validFiles, errorText } = validateFiles(selectedFiles, photos.length);

    setPhotosError(errorText);

    if (!validFiles.length) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const nextPhotos: SelectedPhoto[] = validFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...nextPhotos]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (id: string) => {
    if (isLoading) return;

    setPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id);
      if (target) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((photo) => photo.id !== id);
    });
  };

  const handleRemoveAllPhotos = () => {
    if (isLoading) return;

    photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    setPhotosError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit: SubmitHandler<SubmitForm> = async (formData) => {
    const categoryId = Number(formData.categoryId);
    const authorId = Number(authorIdFromStore ?? formData.authorId);

    if (!categoryId || Number.isNaN(categoryId)) return;
    if (!authorId || Number.isNaN(authorId)) return;

    if (photos.length < MIN_FILES || photos.length > MAX_FILES) {
      setPhotosError(`Choose from ${MIN_FILES} to ${MAX_FILES} photos`);
      return;
    }

    setPhotosError("");

    try {
      await postBook({
        data: {
          name: formData.name.trim(),
          price: Number(formData.price),
          description: formData.description.trim(),
          link: formData.link.trim(),
          authorId,
          categoryId,
        },
        files: photos.map((photo) => photo.file),
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
              className="bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px] px-2 py-1"
              classId="name"
              placeholder="Clean Code"
              textArea="Name"
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
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
              className="bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px] px-2 py-1"
              classId="link"
              placeholder="https://example.com"
              textArea="Link"
            />
            {errors.link && (
              <p className="text-xs text-red-600">{errors.link.message}</p>
            )}
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
              value={field.value ?? ""}
              className="bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px] px-2 py-1"
              classId="price"
              placeholder="100"
              textArea="Price"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                field.onChange(Number(e.target.value))
              }
            />
            {errors.price && (
              <p className="text-xs text-red-600">{errors.price.message}</p>
            )}
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
              className="bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px] px-2 py-1"
              classId="description"
              placeholder="Good book about code..."
              textArea="Description"
            />
            {errors.description && (
              <p className="text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </>
        )}
      />

      <div>
        <label className="mb-1 block text-sm text-white">Photos</label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border bg-white px-2 py-1 text-[14px] font-semibold text-black"
            disabled={isLoading || photos.length >= MAX_FILES}
          >
            Choose photos
          </button>

          {photos.length > 0 && (
            <button
              type="button"
              onClick={handleRemoveAllPhotos}
              className="rounded-md border bg-white px-2 py-1 text-[14px] font-semibold text-black"
              disabled={isLoading}
            >
              Remove all
            </button>
          )}

          <span className="text-sm text-white">
            {photos.length} / {MAX_FILES} selected
          </span>
        </div>

        <p className="mt-1 text-xs text-gray-300">
          Upload from 1 to 10 photos. Max size for each photo is 5 MB.
        </p>

        {photosError && (
          <p className="mt-1 text-xs text-red-600">{photosError}</p>
        )}

        {!photosError && photos.length < 1 && (
          <p className="mt-1 text-xs text-red-600">Choose at least 1 photo</p>
        )}

        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="rounded-md border border-[#2D3748] p-2"
              >
                <img
                  src={photo.preview}
                  alt={photo.file.name}
                  className="h-28 w-full rounded-md object-cover"
                />

                <p className="mt-2 truncate text-[12px] text-white">
                  {photo.file.name}
                </p>

                <p className="text-[11px] text-gray-400">
                  {(photo.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="mt-2 w-full rounded-md border bg-white px-2 py-1 text-[13px] font-semibold text-black"
                  disabled={isLoading}
                >
                  Cancel photo
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <LabelAuthors control={control} name="authorId" />
      {errors.authorId && (
        <p className="text-xs text-red-600">{String(errors.authorId.message)}</p>
      )}

      <LabelCategories control={control} name="categoryId" />
      {errors.categoryId && (
        <p className="text-xs text-red-600">
          {String(errors.categoryId.message)}
        </p>
      )}

      <ButtonApp
        buttonText={isLoading ? "Creating..." : "Create"}
        buttonType="submit"
        className="rounded-md border bg-white px-2 py-2 text-[14px] text-black font-semibold w-full mx-2 mt-60"
      />

      {backendErrorText && (
        <div className="rounded-md border bg-white px-3 py-2 text-[12px] text-black">
          {backendErrorText}
        </div>
      )}
    </form>
  );
};