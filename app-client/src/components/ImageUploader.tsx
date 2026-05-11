import React, { useState, ChangeEvent, useEffect } from "react";

interface Props {
  onChange: (images: string[]) => void;
  defaultValue?: string[];
}

export const ImageUploader = (props: Props) => {
  const [images, setImages] = useState<string[]>(props.defaultValue || []);

  // Keep internal images in sync with external defaultValue changes
  useEffect(() => {
    setImages(props.defaultValue || []);
  }, [props.defaultValue]);

  // Вспомогательная функция для конвертации одного файла
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    // Превращаем FileList в обычный массив
    const files = Array.from(e.target.files);

    try {
      // Запускаем чтение всех файлов параллельно
      const base64Array = await Promise.all(
        files.map((file) => toBase64(file)),
      );

      // Сохраняем в стейт и отдаём родителю полный список
      setImages((prev) => {
        const next = [...prev, ...base64Array].slice(0, 5);
        props.onChange(next);
        return next;
      });
    } catch (error) {
      console.error("Ошибка при чтении файлов:", error);
    }
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
      />
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="preview"
              className="image-preview-thumb"
              title="Нажмите, чтобы удалить"
              onClick={() => {
                const filtered = images.filter((i) => i !== img);
                setImages(filtered);
                props.onChange(filtered);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
