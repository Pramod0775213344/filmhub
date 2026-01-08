"use client";

import { useUpload } from "@/context/UploadContext";
import FloatingUploads from "@/components/admin/FloatingUploads";

export default function GlobalUploadWidget() {
  const { uploadQueue, removeUpload } = useUpload();
  
  return <FloatingUploads uploads={uploadQueue} onClose={removeUpload} />;
}
