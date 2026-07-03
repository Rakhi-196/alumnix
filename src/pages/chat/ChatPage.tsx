import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  MoreVertical,
  Phone,
  Video,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  Avatar,
  Button,
  Input,
  EmptyState,
} from '@/components/ui';
import type { ChatRoom, Message, Profile } from '@/types';
import { format, isToday, isYesterday } from 'date-fns';

export function ChatPage() {
  const { profile } = useAuth();
  const [rooms, setRooms] = useState<(ChatRoom & { last_message?: Message; unread_count?: number })[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchRooms();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages();
      markAsRead();
    }
  }, [selectedRoom]);

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (selectedRoom && newMsg.room_id === selectedRoom.id) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchRooms() {
    if (!profile) return;

    try {
      const { data: memberData } = await supabase
        .from('chat_room_members')
        .select('room_id')
        .eq('user_id', profile.id);

      if (!memberData || memberData.length === 0) {
        setLoading(false);
        return;
      }

      const roomIds = memberData.map((m) => m.room_id);

      const { data: roomData } = await supabase
        .from('chat_rooms')
        .select('*, messages(content, created_at, sender_id), chat_room_members(user_id, profiles(id, full_name, avatar_url))')
        .in('id', roomIds)
        .order('updated_at', { ascending: false });

      if (roomData) {
        setRooms(
          roomData.map((r) => ({
            ...r,
            last_message: r.messages?.[r.messages.length - 1] || undefined,
            members: r.chat_room_members?.map((m: any) => ({
              ...m,
              user: m.profiles,
            })),
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages() {
    if (!selectedRoom) return;

    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)')
      .eq('room_id', selectedRoom.id)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  }

  async function markAsRead() {
    if (!selectedRoom || !profile) return;

    await supabase
      .from('chat_room_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('room_id', selectedRoom.id)
      .eq('user_id', profile.id);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedRoom || !profile) return;

    const { error } = await supabase.from('messages').insert({
      room_id: selectedRoom.id,
      sender_id: profile.id,
      content: newMessage.trim(),
    });

    if (!error) {
      setNewMessage('');
      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedRoom.id);
    }
  }

  const getOtherUser = (room: ChatRoom) => {
    if (room.type === 'direct') {
      const otherMember = (room as any).members?.find(
        (m: any) => m.user_id !== profile?.id
      );
      return otherMember?.user;
    }
    return null;
  };

  const getRoomName = (room: ChatRoom) => {
    if (room.type === 'group' && room.name) {
      return room.name;
    }
    const otherUser = getOtherUser(room);
    return otherUser?.full_name || 'Unknown';
  };

  const getRoomAvatar = (room: ChatRoom) => {
    const otherUser = getOtherUser(room);
    return {
      src: otherUser?.avatar_url,
      name: otherUser?.full_name || room.name,
    };
  };

  const formatMessageTime = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'h:mm a');
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-7rem)]"
    >
      <div className="flex h-full gap-4">
        <Card className="w-80 flex-shrink-0">
          <CardContent className="flex h-full flex-col p-0">
            <div className="border-b border-secondary-200 p-4 dark:border-secondary-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Messages
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowNewChatModal(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Search conversations..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-3"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-12 w-12 animate-pulse rounded-full bg-secondary-200 dark:bg-secondary-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-secondary-200 dark:bg-secondary-700" />
                        <div className="h-3 w-32 animate-pulse rounded bg-secondary-200 dark:bg-secondary-700" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : rooms.length === 0 ? (
                <EmptyState
                  icon={<MessageSquare className="h-10 w-10" />}
                  title="No conversations"
                  description="Start a new conversation to get started."
                  className="py-12"
                />
              ) : (
                <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
                  {rooms
                    .filter((r) =>
                      getRoomName(r).toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary-50 dark:hover:bg-secondary-800 ${
                          selectedRoom?.id === room.id
                            ? 'bg-primary-50 dark:bg-primary-900/20'
                            : ''
                        }`}
                      >
                        <Avatar
                          src={getRoomAvatar(room).src}
                          name={getRoomAvatar(room).name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-secondary-900 dark:text-white truncate">
                            {getRoomName(room)}
                          </p>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400 truncate">
                            {room.last_message?.content || 'No messages yet'}
                          </p>
                        </div>
                        {room.last_message && (
                          <span className="text-xs text-secondary-500 dark:text-secondary-500">
                            {formatMessageTime(room.last_message.created_at)}
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="flex h-full flex-col p-0">
            {selectedRoom ? (
              <>
                <div className="flex items-center justify-between border-b border-secondary-200 p-4 dark:border-secondary-700">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={getRoomAvatar(selectedRoom).src}
                      name={getRoomAvatar(selectedRoom).name}
                      size="md"
                    />
                    <div>
                      <h3 className="font-medium text-secondary-900 dark:text-white">
                        {getRoomName(selectedRoom)}
                      </h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {selectedRoom.type === 'group' ? 'Group chat' : 'Direct message'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.sender_id === profile?.id}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="border-t border-secondary-200 p-4 dark:border-secondary-700">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                icon={<MessageSquare className="h-16 w-16" />}
                title="Select a conversation"
                description="Choose a conversation from the sidebar to start messaging."
                className="h-full"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={() => {
          setShowNewChatModal(false);
          fetchRooms();
        }}
      />
    </motion.div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const sender = message.sender as Profile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwn && <Avatar src={sender?.avatar_url} name={sender?.full_name} size="sm" />}
      <div className={`max-w-[70%] ${isOwn ? 'order-1' : ''}`}>
        {!isOwn && (
          <p className="mb-1 text-xs text-secondary-600 dark:text-secondary-400">
            {sender?.full_name}
          </p>
        )}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-primary-600 text-white'
              : 'bg-secondary-100 text-secondary-900 dark:bg-secondary-800 dark:text-white'
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <p className="mt-1 text-xs text-secondary-500 dark:text-secondary-500">
          {format(new Date(message.created_at), 'h:mm a')}
        </p>
      </div>
    </motion.div>
  );
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: () => void;
}

function NewChatModal({ isOpen, onClose, onChatCreated }: NewChatModalProps) {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, searchQuery]);

  async function fetchUsers() {
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', profile?.id)
      .limit(20);

    if (searchQuery) {
      query = query.ilike('full_name', `%${searchQuery}%`);
    }

    const { data } = await query;
    if (data) setUsers(data);
  }

  async function startChat(otherUserId: string) {
    if (!profile) return;

    setLoading(true);

    const { data: existingRooms } = await supabase
      .from('chat_room_members')
      .select('room_id')
      .eq('user_id', profile.id);

    if (existingRooms && existingRooms.length > 0) {
      const roomIds = existingRooms.map((r) => r.room_id);
      const { data: existingMembers } = await supabase
        .from('chat_room_members')
        .select('room_id')
        .eq('user_id', otherUserId)
        .in('room_id', roomIds);

      if (existingMembers && existingMembers.length > 0) {
        const { data: roomData } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', existingMembers[0].room_id)
          .eq('type', 'direct')
          .single();

        if (roomData) {
          setLoading(false);
          onChatCreated();
          return;
        }
      }
    }

    const { data: newRoom, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({ type: 'direct', created_by: profile.id })
      .select()
      .single();

    if (roomError || !newRoom) {
      setLoading(false);
      return;
    }

    await supabase.from('chat_room_members').insert([
      { room_id: newRoom.id, user_id: profile.id },
      { room_id: newRoom.id, user_id: otherUserId },
    ]);

    setLoading(false);
    onChatCreated();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-secondary-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
            New Message
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <Input
          placeholder="Search users..."
          leftIcon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        <div className="max-h-64 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => startChat(user.id)}
              disabled={loading}
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary-50 dark:hover:bg-secondary-800"
            >
              <Avatar src={user.avatar_url} name={user.full_name} size="md" />
              <div>
                <p className="font-medium text-secondary-900 dark:text-white">
                  {user.full_name}
                </p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {user.role}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
