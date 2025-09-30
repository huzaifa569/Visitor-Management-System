export interface CloudinaryResponse {
  secure_url: string;
}

export const uploadBase64File = async (
  base64Data: string,
  type: string,
  setLoading?: (val: boolean) => void
): Promise<string | null> => {
  if (setLoading) setLoading(true);

  try {
    const formData = new FormData();
    formData.append('file', base64Data); // Pass full data URL
    formData.append('upload_preset', 'visitor-management-system');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dizxfdmk5/${type}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const file: CloudinaryResponse = await res.json();

    if (!res.ok) {
      console.error('Cloudinary response error:', file);
      return null;
    }
    console.log(file.secure_url);
    
    return file.secure_url;
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    return null;
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result); // Already in "data:image/png;base64,..." format
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
