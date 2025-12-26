import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Section, Container, Badge } from '../components';
import SEO from '../components/SEO';
import { getBlogPostBySlug, getRecentPosts } from '../data/blog';
import { BlogImage } from '../components/ui/OptimizedImage';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;
  const recentPosts = getRecentPosts(3).filter(p => p.slug !== slug);

  if (!post) {
    return (
      <>
        <SEO title="Post Not Found" description="The requested blog post could not be found." />
        <Section className="min-h-[60vh] flex items-center">
          <Container>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
              <p className="text-gray-400 mb-8">
                The blog post you're looking for doesn't exist or has been moved.
              </p>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
            </div>
          </Container>
        </Section>
      </>
    );
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <SEO
        title={`${post.title} | CodeWeavers Blog`}
        description={post.excerpt}
        image={post.coverImage}
        type="article"
        publishedTime={post.publishedAt}
        author={post.author}
      />

      {/* Hero Section */}
      <section className="bg-linear-to-br from-gray-900 via-gray-950 to-indigo-950 py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back Link */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="default" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400">
              <span className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {post.readTime}
              </span>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative -mt-4">
          <Container>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="overflow-hidden rounded-xl border border-gray-800"
            >
              <BlogImage
                src={post.coverImage}
                alt={post.title}
                className="w-full"
              />
            </motion.div>
          </Container>
        </div>
      )}

      {/* Content */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-8"
            >
              <div 
                className="prose prose-lg prose-invert prose-indigo max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Author Box */}
              <div className="mt-12 p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                    DK
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Dwarika Kumar</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Full-Stack Developer & Technical Trainer with 4+ years of experience 
                      helping students launch their tech careers.
                    </p>
                    <Link
                      to="/about"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm mt-2"
                    >
                      Learn more about me
                      <ArrowLeft className="h-3 w-3 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-4"
            >
              {/* Recent Posts */}
              <div className="sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-indigo-400" />
                  Recent Posts
                </h3>
                <div className="space-y-4">
                  {recentPosts.map((recentPost) => (
                    <Link
                      key={recentPost.id}
                      to={`/blog/${recentPost.slug}`}
                      className="block p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-indigo-500/50 transition-colors group"
                    >
                      <h4 className="text-white font-medium group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {recentPost.title}
                      </h4>
                      <p className="text-gray-500 text-sm mt-1">{recentPost.readTime}</p>
                    </Link>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-8 p-6 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
                  <h4 className="text-white font-semibold mb-2">Want to Learn More?</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Join my bootcamp programs and master these skills hands-on.
                  </p>
                  <Link
                    to="/bootcamps"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Bootcamps
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Link>
                </div>
              </div>
            </motion.aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
