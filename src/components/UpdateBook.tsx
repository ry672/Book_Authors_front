import { useEffect, useRef, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useGetBookByIdQuery, usePatchBookMutation } from "../store/Api/BookApi";
import { InputApp } from "./UX/InputApp";
import { ButtonApp } from "./UX/ButtonApp";
import { LabelCategories } from "./LabelCategories";
import { LabelAuthors } from "./LabelAuthors";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

type FormValues = {
  name: string;
  link: string;
  price: number;
  description: string;
  categoryId: number | null;
  authorId: number | null;
};

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
  description: yup
    .string()
    .trim()
    .min(20, "minimum 20 string")
    .required("Fill"),
  categoryId: yup
    .number()
    .nullable()
    .typeError("Choose category")
    .required("Choose category"),
  authorId: yup
    .number()
    .nullable()
    .typeError("Choose author")
    .required("Choose author"),
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

const SERVER_URL =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ||
  (import.meta.env.VITE_EXCHANGE_API_BASE_URL as string | undefined) ||
  "";

function getPhotoUrl(photo?: string): string {
  if (!photo) return "";

  const normalized = photo.replace(/^https(?=\/\/)/, "https:");

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    return normalized;
  }

  const base = SERVER_URL.replace(/\/+$/, "");
  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;

  return `${base}${path}`;
}

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

  const [newPhotos, setNewPhotos] = useState<SelectedPhoto[]>([]);
  const [removedOldPhotos, setRemovedOldPhotos] = useState<string[]>([]);
  const [photosError, setPhotosError] = useState("");
  const [replaceAllPhotos, setReplaceAllPhotos] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentPhotosRef = useRef<SelectedPhoto[]>([]);

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
      authorId: null,
    },
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  useEffect(() => {
    currentPhotosRef.current = newPhotos;
  }, [newPhotos]);

  useEffect(() => {
    return () => {
      currentPhotosRef.current.forEach((photo) => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, []);

  useEffect(() => {
    if (!book) return;

    setNewPhotos((prev) => {
      prev.forEach((photo) => URL.revokeObjectURL(photo.preview));
      return [];
    });

    setRemovedOldPhotos([]);
    setPhotosError("");
    setReplaceAllPhotos(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    reset({
      name: book.name ?? "",
      link: book.link ?? "",
      price: book.price ?? 1,
      description: book.description ?? "",
      categoryId: book.categoryId ?? null,
      authorId: book.authorId ?? null,
    });
  }, [book, reset]);

  const existingPhotos = book?.photos ?? [];

  const visibleOldPhotos = replaceAllPhotos
    ? []
    : existingPhotos.filter((photo) => !removedOldPhotos.includes(photo));

  const currentTotalPhotos = visibleOldPhotos.length + newPhotos.length;

  const validateIncomingFiles = (files: File[]) => {
    const errorsList: string[] = [];
    const validFiles: File[] = [];

    const alreadyCount = visibleOldPhotos.length + newPhotos.length;

    if (alreadyCount + files.length > MAX_FILES) {
      return {
        validFiles: [],
        errorText: `You can have maximum ${MAX_FILES} photos`,
      };
    }

    for (const file of files) {
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

    return {
      validFiles,
      errorText: errorsList.join(", "),
    };
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSaving) return;

    const selectedFiles = Array.from(e.target.files ?? []);
    if (!selectedFiles.length) return;

    const { validFiles, errorText } = validateIncomingFiles(selectedFiles);
    setPhotosError(errorText);

    if (!validFiles.length) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const prepared: SelectedPhoto[] = validFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()
        .toString(36)
        .slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewPhotos((prev) => [...prev, ...prepared]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveNewPhoto = (photoId: string) => {
    if (isSaving) return;

    setNewPhotos((prev) => {
      const target = prev.find((photo) => photo.id === photoId);
      if (target) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((photo) => photo.id !== photoId);
    });
  };

  const handleRemoveAllNewPhotos = () => {
    if (isSaving) return;

    setNewPhotos((prev) => {
      prev.forEach((photo) => URL.revokeObjectURL(photo.preview));
      return [];
    });

    setPhotosError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveOldPhoto = (photoUrl: string) => {
    if (isSaving) return;
    setRemovedOldPhotos((prev) =>
      prev.includes(photoUrl) ? prev : [...prev, photoUrl]
    );
  };

  const handleRestoreOldPhoto = (photoUrl: string) => {
    if (isSaving) return;
    setRemovedOldPhotos((prev) => prev.filter((item) => item !== photoUrl));
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const categoryId = values.categoryId ?? undefined;
    const authorId = values.authorId ?? undefined;

    const finalPhotosCount = visibleOldPhotos.length + newPhotos.length;

    if (finalPhotosCount < MIN_FILES || finalPhotosCount > MAX_FILES) {
      setPhotosError(`Photos must be from ${MIN_FILES} to ${MAX_FILES}`);
      return;
    }

    setPhotosError("");

    try {
      await patchBook({
        id,
        data: {
          name: values.name.trim(),
          link: values.link.trim(),
          price: Number(values.price),
          description: values.description.trim(),
          categoryId,
          authorId,
          remove_photos: replaceAllPhotos,
          remove_photo_urls: replaceAllPhotos ? [] : removedOldPhotos,
        },
        files: newPhotos.map((photo) => photo.file),
      }).unwrap();

      onSuccess?.();
    } catch (e) {
      console.log("Update book failed:", e);
    }
  };

  const backendMessage = getErrorMessage(saveError);

  if (isBookLoading) return <div>Loading...</div>;
  if (isError || !book) return <div>Book not found</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
              placeholder="About book..."
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

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-white">Saved photos</label>

          {existingPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {existingPhotos.map((photo, index) => {
                const removed = removedOldPhotos.includes(photo);
                return (
                  <div
                    key={`${photo}-${index}`}
                    className="rounded-md border border-[#2D3748] p-2"
                  >
                    <img
                      src={getPhotoUrl(photo)}
                      alt={`Saved photo ${index + 1}`}
                      className={`h-28 w-full rounded-md object-cover ${
                        removed ? "opacity-40" : ""
                      }`}
                    />

                    <p className="mt-2 text-[12px] text-gray-300">
                      Saved photo {index + 1}
                    </p>

                    {!replaceAllPhotos && (
                      <button
                        type="button"
                        onClick={() =>
                          removed
                            ? handleRestoreOldPhoto(photo)
                            : handleRemoveOldPhoto(photo)
                        }
                        className={`mt-2 w-full rounded-md  px-2 py-1 text-[13px] font-semibold ${
                          removed
                            ? "bg-blue-600 text-white"
                            : "bg-white text-black"
                        }`}
                        disabled={isSaving}
                      >
                        {removed ? "Restore photo" : "Remove photo"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No saved photos</p>
          )}
        </div>

        <div className="rounded-md border border-[#2D3748] p-3">
          <label className="mb-2 flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              checked={replaceAllPhotos}
              onChange={(e) => {
                setReplaceAllPhotos(e.target.checked);
                setPhotosError("");
                if (e.target.checked) {
                  setRemovedOldPhotos([]);
                }
              }}
              disabled={isSaving}
            />
            Replace all old photos
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="hidden"
            disabled={isSaving}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border bg-white px-2 py-1 text-[14px] font-semibold text-black"
              disabled={isSaving || currentTotalPhotos >= MAX_FILES}
            >
              Choose photos
            </button>

            {newPhotos.length > 0 && (
              <button
                type="button"
                onClick={handleRemoveAllNewPhotos}
                className="rounded-md border bg-white px-2 py-1 text-[14px] font-semibold text-black"
                disabled={isSaving}
              >
                Remove all new
              </button>
            )}

            <span className="text-sm text-white">
              {currentTotalPhotos} / {MAX_FILES}
            </span>
          </div>

          {/* <p className="mt-2 text-xs text-gray-300">
            New photos: max {MAX_FILES} total, each photo max {MAX_FILE_SIZE_MB} MB
          </p> */}

          {photosError && (
            <p className="mt-1 text-xs text-red-600">{photosError}</p>
          )}

          {newPhotos.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {newPhotos.map((photo) => (
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
                    onClick={() => handleRemoveNewPhoto(photo.id)}
                    className="mt-2 w-full rounded-md border bg-white px-2 py-1 text-[13px] font-semibold text-black"
                    disabled={isSaving}
                  >
                    Cancel photo
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <LabelAuthors control={control} name="authorId" />
      {errors.authorId && (
        <p className="text-xs text-red-600">
          {String(errors.authorId.message)}
        </p>
      )}

      <LabelCategories control={control} name="categoryId" />
      {errors.categoryId && (
        <p className="text-xs text-red-600">
          {String(errors.categoryId.message)}
        </p>
      )}

      {backendMessage && (
        <p className="text-xs text-red-600">{backendMessage}</p>
      )}

      <ButtonApp
        buttonText={isSaving ? "Saving..." : "Update"}
        buttonType="submit"
        className="rounded-md border bg-white px-2 py-2 text-[14px] text-black font-semibold w-full mx-2 mt-60"
      />
    </form>
  );
};