import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminPage from "./pages/AdminPage";
import DonatePage from "./pages/DonatePage";
import DownloadsPage from "./pages/DownloadsPage";
import HomePage from "./pages/HomePage";
import JoinPage from "./pages/JoinPage";
import PrayersPage from "./pages/PrayersPage";
import SongDetailPage from "./pages/SongDetailPage";
import SongsPage from "./pages/SongsPage";
import SupportPage from "./pages/SupportPage";
import UploadPage from "./pages/UploadPage";

export type Page =
  | { name: "home" }
  | { name: "songs" }
  | { name: "prayers" }
  | { name: "upload" }
  | { name: "support" }
  | { name: "donate" }
  | { name: "join" }
  | { name: "downloads" }
  | { name: "song"; id: bigint }
  | { name: "admin" };

export default function App() {
  const [page, setPage] = useState<Page>({ name: "home" });

  function navigate(p: Page) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {page.name === "home" && <HomePage navigate={navigate} />}
      {page.name === "songs" && <SongsPage navigate={navigate} />}
      {page.name === "prayers" && <PrayersPage navigate={navigate} />}
      {page.name === "upload" && <UploadPage navigate={navigate} />}
      {page.name === "support" && <SupportPage navigate={navigate} />}
      {page.name === "donate" && <DonatePage navigate={navigate} />}
      {page.name === "join" && <JoinPage navigate={navigate} />}
      {page.name === "downloads" && <DownloadsPage navigate={navigate} />}
      {page.name === "song" && (
        <SongDetailPage id={page.id} navigate={navigate} />
      )}
      {page.name === "admin" && <AdminPage navigate={navigate} />}
      <Toaster richColors position="top-right" />
    </>
  );
}
