import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useGetAuthorByIdQuery,
  usePatchAuthorMutation,
} from "../store/Api/AuthorApi";
import { InputApp } from "./UX/InputApp";
import { ButtonApp } from "./UX/ButtonApp";
import * as yup from "yup";
import defaultAvatar from "../images/icons8-user-default-64.png";

type FormValues = {
  name: string;
  full_name: string;
  description: string;
  country: string;
};

const schema = yup.object({
  name: yup.string().trim().min(2, "minimum 2 string").required("Fill"),
  full_name: yup.string().trim().min(3, "minimum 3 string").required("Fill"),
  description: yup.string().trim().min(5, "minimum 5 string").required("Fill"),
  country: yup.string().trim().min(2, "minimum 2 string").required("Fill"),
});

export const UpdateAuthorAside = ({
  id,
  onSuccess,
}: {
  id: number;
  onSuccess?: () => void;
}) => {
  const { data: author, isLoading, isError } = useGetAuthorByIdQuery(id);
  const [patchAuthor, { isLoading: isSaving, error: saveError }] =
    usePatchAuthorMutation();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      full_name: "",
      description: "",
      country: "",
    },
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (!author) return;

    reset({
      name: author.name ?? "",
      full_name: author.full_name ?? "",
      description: author.description ?? "",
      country: author.country ?? "",
    });

    setFile(null);
    setPreview("");
    setRemoveCurrentImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [author, reset]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const loading = isSaving || isSubmitting || isLocked;

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (!author || loading) return;

    setIsLocked(true);

    try {
      await patchAuthor({
        id,
        data: {
          ...values,
          remove_photo: removeCurrentImage ? "true" : undefined,
        },
        file,
      }).unwrap();

      setFile(null);
      setPreview("");
      setRemoveCurrentImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onSuccess?.();
    } catch (e) {
      console.log("Update author failed:", e);
    } finally {
      setIsLocked(false);
    }
  };

  const currentImage = useMemo(() => {
    if (preview) return preview;
    if (removeCurrentImage) return defaultAvatar;
    if (!author?.author_photo?.trim()) return defaultAvatar;

    if (
      author.author_photo.startsWith("http://") ||
      author.author_photo.startsWith("https://")
    ) {
      return author.author_photo;
    }

    const baseUrl = import.meta.env.VITE_SERVER_URL?.replace(/\/$/, "") ?? "";
    const normalizedPhoto = author.author_photo.startsWith("/")
      ? author.author_photo
      : `/${author.author_photo}`;

    return `${baseUrl}${normalizedPhoto}`;
  }, [author, preview, removeCurrentImage]);

  const backendMessage =
    saveError &&
    typeof saveError === "object" &&
    saveError !== null &&
    "data" in saveError
      ? Array.isArray(
          (saveError as { data?: { message?: string | string[] } }).data
            ?.message
        )
        ? (
            saveError as { data?: { message?: string[] } }
          ).data?.message?.join(", ")
        : String(
            (saveError as { data?: { message?: string } }).data?.message ?? ""
          )
      : null;

  const handleCancelFile = () => {
    if (loading) return;

    setFile(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return;

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setRemoveCurrentImage(false);
    setFile(selectedFile);
  };

  const handleDeleteCurrentImage = () => {
    if (loading) return;

    setFile(null);
    setPreview("");
    setRemoveCurrentImage(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !author) return <div>Author not found</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <>
            <InputApp
              {...field}
              disabled={loading}
              className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
              classId="name"
              placeholder="Author name"
              textArea="Name"
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </>
        )}
      />

      <Controller
        name="full_name"
        control={control}
        render={({ field }) => (
          <>
            <InputApp
              {...field}
              disabled={loading}
              className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
              classId="full_name"
              placeholder="Full name"
              textArea="Full name"
            />
            {errors.full_name && (
              <p className="text-xs text-red-600">{errors.full_name.message}</p>
            )}
          </>
        )}
      />

      <Controller
        name="country"
        control={control}
        render={({ field }) => (
          <>
            <InputApp
              {...field}
              disabled={loading}
              className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
              classId="country"
              placeholder="Country"
              textArea="Country"
            />
            {errors.country && (
              <p className="text-xs text-red-600">{errors.country.message}</p>
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
              disabled={loading}
              className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
              classId="description"
              placeholder="About author..."
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

      {backendMessage && (
        <p className="text-xs text-red-600">{backendMessage}</p>
      )}

      <div className="pt-2">
        <label className="mb-2 block text-sm">Avatar</label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="rounded-md border bg-white px-3 py-2 text-[12px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            Choose file
          </button>

          <span className="text-xs text-white">
            {file ? `Selected: ${file.name}` : ""}
          </span>
        </div>

        <img
          src={currentImage}
          alt="Preview"
          className="mt-2 h-24 w-24 rounded-md object-cover"
          onError={(e) => {
            e.currentTarget.src = defaultAvatar;
          }}
        />

        <div className="mt-2 flex gap-2">
          {!!author.author_photo && !removeCurrentImage && !file && (
            <button
              type="button"
              onClick={handleDeleteCurrentImage}
              disabled={loading}
              className="rounded-md border bg-white px-3 py-2 text-[12px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete current image
            </button>
          )}

          {file && (
            <button
              type="button"
              onClick={handleCancelFile}
              disabled={loading}
              className="rounded-md border bg-white px-3 py-2 text-[12px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel file
            </button>
          )}
        </div>
      </div>

      <ButtonApp
        buttonText={loading ? "Saving..." : "Update"}
        buttonType="submit"
        disabled={loading}
        className="mx-2 mt-5 w-full rounded-md border bg-white px-2 py-2 text-[14px] font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
      />
    </form>
  );
};