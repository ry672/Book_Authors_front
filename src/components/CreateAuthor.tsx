import { useEffect, useRef, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { usePostAuthorMutation } from "../store/Api/AuthorApi";
import { InputApp } from "../components/UX/InputApp";
import { ButtonApp } from "../components/UX/ButtonApp";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";

interface SubmitForm {
  name: string;
  full_name: string;
  description: string;
  country: string;
  email: string;
  password: string;
}

const schema: yup.ObjectSchema<SubmitForm> = yup.object({
  name: yup.string().trim().min(2, "minimum 2 string").required("Fill"),
  full_name: yup.string().trim().min(3, "minimum 3 string").required("Fill"),
  description: yup.string().trim().min(5, "minimum 5 string").required("Fill"),
  country: yup.string().trim().min(2, "minimum 2 string").required("Fill"),
  email: yup.string().trim().email("Invalid email").required("Fill"),
  password: yup.string().trim().min(6, "minimum 6 string").required("Fill"),
});

export const CreateAuthorAside = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const [postAuthor, { isLoading: isCreating, error }] =
    usePostAuthorMutation();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitForm>({
    defaultValues: {
      name: "",
      full_name: "",
      description: "",
      country: "",
      email: "",
      password: "",
    },
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const loading = isSubmitting || isCreating || isLocked;

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

  const onSubmit: SubmitHandler<SubmitForm> = async (formData) => {
    if (loading) return;

    setIsLocked(true);

    try {
      await postAuthor({
        data: formData,
        file,
      }).unwrap();

      reset();
      setFile(null);
      setPreview("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onSuccess?.();
      navigate("/author-page");
    } catch (e) {
      console.log("Create author failed:", e);
    } finally {
      setIsLocked(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return;

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
  };

  const handleCancelFile = () => {
    if (loading) return;

    setFile(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 bg-[#10141C]"
    >
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
              placeholder="Rufina"
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
              placeholder="Garaeva"
              textArea="Full Name"
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
              placeholder="Tashkent"
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

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <>
            <InputApp
              {...field}
              disabled={loading}
              className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
              classId="email"
              placeholder="Email"
              textArea="Email"
            />
            {errors.email && (
              <p className="text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </>
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <>
            <InputApp
              {...field}
              disabled={loading}
              className="rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-[14px]"
              classId="password"
              placeholder="Password"
              textArea="Password"
            />
            {errors.password && (
              <p className="text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </>
        )}
      />

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

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-2 h-24 w-24 rounded-md border border-[#2D3748] object-cover"
          />
        )}

        {file && (
          <button
            type="button"
            onClick={handleCancelFile}
            disabled={loading}
            className="mt-2 rounded-md border bg-white px-3 py-2 text-[12px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      <ButtonApp
        buttonText={loading ? "Creating..." : "Create"}
        buttonType="submit"
        disabled={loading}
        className="mx-2 mt-5 w-full rounded-md border bg-white px-2 py-2 text-[14px] font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
      />

      {backendMessage && (
        <p className="text-sm text-red-600">{backendMessage}</p>
      )}

      {error && !backendMessage && (
        <p className="text-sm text-red-600">Failed to create author</p>
      )}
    </form>
  );
};