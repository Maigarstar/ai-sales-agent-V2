import ShareConversationClient from "./ShareConversationClient";

export default function SharePage({ params }: { params: { token: string } }) {
  return <ShareConversationClient token={params.token} />;
}
