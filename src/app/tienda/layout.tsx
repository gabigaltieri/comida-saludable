import AnnouncementBar from "@/components/AnnouncementBar";
import StoreNavbar from "@/components/StoreNavbar";

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="sticky top-0 z-50">
        <AnnouncementBar />
        <StoreNavbar />
      </div>
      {children}
    </>
  );
}
