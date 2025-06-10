import { CallDetail } from "@/components/call-detail";

export default function CallDetailPage({ params }: { params: { id: string } }) {
  return <CallDetail callId={params.id} />;
}
