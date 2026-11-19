import TicketView from "./TicketView";

// A ticket page is per-report runtime data: allow a blocking route instead of
// prerendering (Next 16 cacheComponents; see route-segment-config/instant.md).
export const instant = false;

// Server page: read the dynamic segment here so the client view never needs
// useParams (a blocking client hook under cacheComponents).
export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketView id={id} />;
}