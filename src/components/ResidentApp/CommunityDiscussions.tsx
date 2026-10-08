import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from '../../router/Router';
import { ChannelId, CommunityPost } from '../../types';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Heart,
  ThumbsUp,
  Tag,
  AlertCircle,
  Image as ImageIcon,
  HelpCircle,
  ShoppingBag,
  Calendar,
  Sparkles,
  Share2,
  ArrowLeft,
} from 'lucide-react';

export const CommunityDiscussions: React.FC = () => {
  const { posts, createPost, addPostComment, reactToPost, currentUser } = useApp();
  const { navigate, goBack, params } = useRouter();

  const [activeChannel, setActiveChannel] = useState<ChannelId>(() => {
    return (params.channel as ChannelId) || 'general';
  });

  useEffect(() => {
    if (params.channel && ['general', 'buy-sell', 'lost-found', 'events', 'help', 'recommendations'].includes(params.channel)) {
      setActiveChannel(params.channel as ChannelId);
    }
  }, [params.channel]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  // New post form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postPrice, setPostPrice] = useState('');

  // Comment input per post state
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const channels: { id: ChannelId; label: string; icon: any; desc: string }[] = [
    { id: 'general', label: 'General', icon: MessageSquare, desc: 'Casual colony chat & notices' },
    { id: 'buy-sell', label: 'Buy & Sell', icon: ShoppingBag, desc: 'Marketplace for furniture, items' },
    { id: 'lost-found', label: 'Lost & Found', icon: AlertCircle, desc: 'Lost pets, keys, items' },
    { id: 'events', label: 'Events', icon: Calendar, desc: 'Festivals, sports, yoga' },
    { id: 'help', label: 'Resident Help', icon: HelpCircle, desc: 'Emergency neighbor assistance' },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles, desc: 'Maids, cooks, carpenters' },
  ];

  const filteredPosts = posts.filter((p) => {
    const matchesChannel = p.channel === activeChannel;
    const matchesSearch =
      !searchQuery ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    await createPost({
      channel: activeChannel,
      title: postTitle.trim() || undefined,
      content: postContent.trim(),
      imageUrl: postImageUrl.trim() || undefined,
      price: activeChannel === 'buy-sell' ? postPrice.trim() : undefined,
    });

    setPostTitle('');
    setPostContent('');
    setPostImageUrl('');
    setPostPrice('');
    setShowNewPostForm(false);
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    await addPostComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => goBack('/resident')}
            className="p-1.5 rounded-xl border border-[#d3cec6] bg-white hover:bg-stone-100 text-stone-700 transition flex items-center justify-center"
            title="Back to previous page"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-[#111111]">Resident Community Forum</h2>
            <p className="text-xs text-[#7b7b78]">Neighborhood discussions, buy/sell, help & recommendations</p>
          </div>
        </div>
      </div>

      {/* Channels Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {channels.map((ch) => {
          const Icon = ch.icon;
          const isActive = activeChannel === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => {
                setActiveChannel(ch.id);
                navigate(`/resident/community/${ch.id}`);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isActive
                  ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                  : 'bg-white text-stone-700 border-[#d3cec6] hover:bg-stone-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{ch.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search discussions in #${activeChannel}...`}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-white border border-[#d3cec6] focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
        </div>

        <button
          onClick={() => setShowNewPostForm(!showNewPostForm)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#111111] text-white hover:bg-stone-800 text-xs font-semibold transition shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Start Post in #{activeChannel}</span>
        </button>
      </div>

      {/* New Post Form Drawer */}
      {showNewPostForm && (
        <form
          onSubmit={handleCreatePost}
          className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-sm space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-bold text-[#111111]">
              Create New Message in #{activeChannel}
            </span>
            <button
              type="button"
              onClick={() => setShowNewPostForm(false)}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              Cancel
            </button>
          </div>

          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Post Title (optional)"
            className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
          />

          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={3}
            placeholder={`What would you like to share with neighbors in #${activeChannel}?`}
            className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
            required
          />

          {activeChannel === 'buy-sell' && (
            <div>
              <input
                type="text"
                value={postPrice}
                onChange={(e) => setPostPrice(e.target.value)}
                placeholder="Price (e.g. ₹ 4,500 or Free)"
                className="w-full text-xs p-2 rounded-xl border border-stone-200"
              />
            </div>
          )}

          <div>
            <input
              type="url"
              value={postImageUrl}
              onChange={(e) => setPostImageUrl(e.target.value)}
              placeholder="Attach Image URL (optional)"
              className="w-full text-xs p-2 rounded-xl border border-stone-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNewPostForm(false)}
              className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-stone-800"
            >
              Publish to #{activeChannel}
            </button>
          </div>
        </form>
      )}

      {/* Feed List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#d3cec6] text-stone-500 text-xs">
            No discussions in #{activeChannel} yet. Be the first neighbor to post!
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isCommentsOpen = expandedComments[post.id];
            return (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-white border border-[#d3cec6] shadow-xs space-y-3"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-xs">
                      {post.authorName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-[#111111]">{post.authorName}</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded">
                          {post.authorFlat}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#7b7b78]">
                        {new Date(post.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(post.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {post.price && (
                    <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                      {post.price}
                    </span>
                  )}
                </div>

                {/* Content */}
                {post.title && (
                  <h4 className="text-xs font-bold text-[#111111]">{post.title}</h4>
                )}
                <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Image if any */}
                {post.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-stone-100 max-h-72">
                    <img
                      src={post.imageUrl}
                      alt="Attachment"
                      className="w-full object-cover"
                    />
                  </div>
                )}

                {/* Reactions & Interaction bar */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    {['👍', '❤️', '👏', '🙏'].map((emoji) => {
                      const count = post.reactions?.[emoji] || 0;
                      return (
                        <button
                          key={emoji}
                          onClick={() => reactToPost(post.id, emoji)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs transition"
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span className="text-[10px] font-semibold">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    className="flex items-center gap-1.5 text-[11px] font-medium text-stone-600 hover:text-[#111111]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.commentsCount || 0} Comments</span>
                  </button>
                </div>

                {/* Threaded Comments Section */}
                {isCommentsOpen && (
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    {/* List of comments */}
                    {(post.comments || []).map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-xl bg-stone-50 text-xs space-y-0.5 border border-stone-100"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[11px] text-stone-900">
                            {c.authorName} ({c.authorFlat})
                          </span>
                          <span className="text-[10px] text-[#7b7b78]">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-stone-700 text-[11px]">{c.content}</p>
                      </div>
                    ))}

                    {/* Comment input form */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        placeholder="Write a reply..."
                        className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="px-3 py-1.5 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-stone-800 disabled:opacity-40 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
