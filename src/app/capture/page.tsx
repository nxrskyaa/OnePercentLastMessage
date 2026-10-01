import { notFound } from "next/navigation";
import { CaptureSession } from "./CaptureSession";

export default function CapturePage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <CaptureSession />;
}
