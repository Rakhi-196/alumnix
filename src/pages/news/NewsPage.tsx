import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Newspaper,
  MessageCircle,
  Share2,
  ChevronRight,
  Pin,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  Avatar,
  Badge,
  Button,
  Input,
  EmptyState,
} from '@/components/ui';
import type { NewsPost, NewsCategory } from '@/types';
import { toast } from 'sonner';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const categoryFilters = [
  { value: '', label: 'All' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'achievement', label: 'Achievements' },
  { value: 'event', label: 'Events' },
  { value: 'job', label: 'Jobs' },
  { value: 'general', label: 'General' },
];

export function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter]);

  async function fetchPosts() {
    try {
      let query = supabase
        .from('news_posts')
        .select('*, profiles!news_posts_author_id_fkey(id, full_name, avatar_url)')
        .eq('status', 'published')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (categoryFilter) {
        query = query.eq('category', categoryFilter as NewsCategory);
      }

      const { data, error } = await query;
      if (!error && data) {
        setPosts(
          data.map((p) => ({
            ...p,
            author: p.profiles as any,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleExpand = (postId: string) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">News Feed</h1>
            <p className="mt-1 text-secondary-600 dark:text-secondary-400">
              Stay updated with the latest news and announcements
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-2">
        {categoryFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={categoryFilter === filter.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setCategoryFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </motion.div>

      <motion.div variants={item}>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-secondary-200 dark:bg-secondary-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/4 rounded bg-secondary-200 dark:bg-secondary-700" />
                    <div className="h-3 w-1/3 rounded bg-secondary-200 dark:bg-secondary-700" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-secondary-200 dark:bg-secondary-700" />
                  <div className="h-4 w-full rounded bg-secondary-200 dark:bg-secondary-700" />
                </div>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Newspaper className="h-12 w-12" />}
            title="No news yet"
            description="Check back later for updates from the community."
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <motion.div key={post.id} variants={item}>
                <NewsPostCard
                  post={post}
                  isExpanded={expandedPost === post.id}
                  onToggleExpand={() => toggleExpand(post.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

interface NewsPostCardProps {
  post: NewsPost;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function NewsPostCard({ post, isExpanded, onToggleExpand }: NewsPostCardProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    const { data, error } = await supabase
      .from('news_comments')
      .insert({
        news_id: post.id,
        author_id: user.id,
        content: newComment,
      })
      .select('*, profiles!news_comments_author_id_fkey(id, full_name, avatar_url)')
      .single();

    if (error) {
      toast.error('Failed to add comment');
    } else {
      setComments([...comments, data as any]);
      setNewComment('');
    }
  };

  return (
    <Card className={post.is_pinned ? 'border-warning-300 bg-warning-50/50 dark:border-warning-700 dark:bg-warning-950/20' : ''}>
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <Avatar src={post.author?.avatar_url} name={post.author?.full_name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-secondary-900 dark:text-white">
                {post.author?.full_name}
              </h4>
              {post.is_pinned && (
                <Badge variant="warning" size="sm">
                  <Pin className="mr-1 h-3 w-3" />
                  Pinned
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400">
              <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
              <span>·</span>
              <Badge variant="primary" size="sm">
                {post.category}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
            {post.title}
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-secondary-600 dark:text-secondary-400">
            {isExpanded ? post.content : post.content.slice(0, 280)}
            {post.content.length > 280 && !isExpanded && '...'}
          </p>
          {post.content.length > 280 && (
            <button
              className="mt-2 text-sm font-medium link inline-flex items-center gap-1"
              onClick={onToggleExpand}
            >
              {isExpanded ? 'Show less' : 'Read more'}
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>

        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="mt-4 w-full rounded-lg object-cover max-h-96"
          />
        )}

        <div className="mt-4 flex items-center justify-between border-t border-secondary-200 pt-4 dark:border-secondary-700">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="h-4 w-4" />
              <span className="ml-1">{comments.length}</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 border-t border-secondary-200 pt-4 dark:border-secondary-700">
            <div className="space-y-3">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar src={comment.author?.avatar_url} name={comment.author?.full_name} size="sm" />
                  <div className="flex-1 rounded-lg bg-secondary-50 p-3 dark:bg-secondary-800">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-secondary-900 dark:text-white">
                        {comment.author?.full_name}
                      </span>
                      <span className="text-xs text-secondary-500 dark:text-secondary-400">
                        {format(new Date(comment.created_at), 'MMM d')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-secondary-700 dark:text-secondary-300">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
