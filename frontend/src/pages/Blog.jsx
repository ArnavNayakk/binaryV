import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDraggable } from "react-use-draggable-scroll";
import { getWithExpiry, setWithExpiry } from "../helper/storageWithExpiry";
import BACKEND_URI from "../helper/backend";
import api from "../api/axiosClient";

const Blog = () => {
  const scrollRef = useRef(null);
  const { events } = useDraggable(scrollRef);
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const cached = getWithExpiry("articles");
      if (cached) {
        setArticles(cached.slice(0, 10));
        return;
      }
      const res = await api.get("/api/blog/get");
      setArticles(res.data.data.slice(0, 10) || []);
      setWithExpiry("articles", res?.data?.data, ONE_DAY);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const featuredArticle = articles[0];
  const recentArticles = useMemo(() => articles.slice(1, 6), [articles]);
  const insightPills = useMemo(
    () => [
      `${articles.length || 0}+ market reads`,
      "Trading psychology",
      "Risk management",
      "Crypto trends",
    ],
    [articles.length]
  );

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-dark text-white px-6 md:px-8 pt-16 pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] p-6 md:p-10 shadow-[0_40px_120px_rgba(2,6,23,0.55)]">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">
                Binary V Journal
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
                Trading ideas, market reads, and sharper execution habits
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-300">
                Explore practical articles on crypto, psychology, risk, and the
                routines that help traders stay consistent.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {insightPills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-200"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
                Editorial focus
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                {[
                  { value: "Weekly", label: "fresh analysis" },
                  { value: "10+", label: "core reads" },
                  { value: "3 min", label: "quick lessons" },
                  { value: "Live", label: "market mindset" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/8 bg-slate-950/60 p-4"
                  >
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="h-[420px] animate-pulse rounded-[32px] bg-white/6" />
            <div className="space-y-4">
              <div className="h-32 animate-pulse rounded-[24px] bg-white/6" />
              <div className="h-32 animate-pulse rounded-[24px] bg-white/6" />
              <div className="h-32 animate-pulse rounded-[24px] bg-white/6" />
            </div>
          </div>
        ) : featuredArticle ? (
          <>
            <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/80">
                <img
                  src={`${BACKEND_URI}${featuredArticle.bannerImage}`}
                  alt={featuredArticle.title}
                  className="h-[300px] w-full object-cover"
                />
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">
                      Featured
                    </span>
                    <span className="text-slate-400">
                      {new Date(featuredArticle?.lastUpdated).toLocaleDateString()}
                    </span>
                    <span className="text-slate-400">
                      {featuredArticle?.createdBy || "Binary V"}
                    </span>
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold">
                    {featuredArticle.title}
                  </h2>
                  <p className="mt-4 max-w-3xl text-slate-300 line-clamp-4">
                    {featuredArticle.description}
                  </p>
                  <button
                    onClick={() => navigate(`${featuredArticle._id}`)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
                  >
                    Read featured article <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Quick picks</h2>
                  <button
                    onClick={() => navigate("all")}
                    className="text-sm text-emerald-300 hover:text-emerald-200"
                  >
                    View all
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {recentArticles.map((article) => (
                    <button
                      key={article._id}
                      onClick={() => navigate(`${article._id}`)}
                      className="w-full rounded-[24px] border border-white/8 bg-slate-950/70 p-4 text-left transition hover:border-emerald-400/30 hover:bg-slate-900"
                    >
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                        {article?.createdBy || "Binary V"}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                        {article.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-14">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Recent Articles</h2>
                  <p className="mt-2 text-slate-400">
                    Swipe through the latest reads and open any article in one
                    click.
                  </p>
                </div>

                <div className="space-x-3">
                  <button
                    onClick={() => scroll("left")}
                    className="rounded-full border border-white/10 bg-white/6 p-2 cursor-pointer transition hover:bg-emerald-400 hover:text-slate-950"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={() => scroll("right")}
                    className="rounded-full border border-white/10 bg-white/6 p-2 cursor-pointer transition hover:bg-emerald-400 hover:text-slate-950"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>

              <div
                ref={scrollRef}
                {...events}
                className="mt-8 flex gap-6 overflow-x-auto cursor-grab select-none scrollbar-hide pb-2"
              >
                {articles.map((article) => (
                  <div
                    key={article._id}
                    className="min-w-[300px] max-w-[360px] rounded-[28px] border border-white/10 bg-slate-950/80 p-4 transition hover:-translate-y-1 hover:border-emerald-400/30"
                  >
                    <img
                      src={`${BACKEND_URI}${article?.bannerImage}`}
                      alt={article.title}
                      className="rounded-[20px] mb-4 h-48 w-full object-cover"
                    />
                    <div className="flex justify-between gap-3 text-sm text-slate-400">
                      <span className="text-emerald-300">{article?.createdBy}</span>
                      <span>
                        {new Date(article?.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-white">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-sm text-slate-400 line-clamp-3">
                      {article.description}
                    </p>
                    <button
                      onClick={() => navigate(`${article._id}`)}
                      className="mt-4 text-emerald-300 flex items-center gap-1 hover:text-emerald-200 cursor-pointer"
                    >
                      Read more <ArrowRight size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-12 rounded-[28px] border border-white/10 bg-white/6 p-10 text-center">
            <LoaderCircle className="mx-auto mb-4 text-emerald-300" />
            <p className="text-2xl font-semibold">No articles available yet</p>
            <p className="mt-2 text-slate-400">
              Connect the blog feed or publish the first post to populate this page.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
