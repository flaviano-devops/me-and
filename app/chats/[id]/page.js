import ChatRoom from "@/components/ChatRoom";
export const metadata = { title: "Chat" };
export default async function ChatRoomPage({ params }) { const { id } = await params; return <ChatRoom roomId={id}/>; }
