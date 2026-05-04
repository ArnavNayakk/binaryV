import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axiosClient";
import { useState } from "react";
import { useEffect } from "react";
import BACKEND_URI from "../../helper/backend";
import PageLoader from "../Loader/PageLoader";
import { getWithExpiry, setWithExpiry } from "../../helper/storageWithExpiry";

const cardVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, ease: "easeOut" },
  },
};
const AllArticle = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const cached = getWithExpiry("articles");
      if (cached) {
        setArticles(cached);
        return;
      }
      const res = await api.cachedGet("/api/blog/get");
      setArticles(res.data.data || []);
      setWithExpiry("articles", res?.data?.data, ONE_DAY);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch blogs
  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="w-full h-full">
      {isLoading ? (
        <PageLoader />
      ) : articles.length === 0 ? (
        <div className="w-full h-full flex flex-col justify-center items-center gap-4">
          <p className="text-2xl text-gray-500">No Articles found.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green px-3 py-2 rounded hover:bg-green-700 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      ) : (
        <section className="py-16 px-8 text-white">
          <div className="mt-12">
            <h2 className="text-2xl font-semibold">All Articles</h2>

            <div
              className={`grid grid-cols-1 space-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 scrollbar-hide mt-8`}
            >
              {articles.map((article) => (
                <motion.div
                  key={article._id}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.8,
                    delay: (articles.indexOf(article) + 1) * 0.08,
                    ease: "easeOut",
                  }}
                  className="rounded-lg space-y-2 border border-gray-600 p-4 hover:scale-95 duration-300 transition"
                >
                  <img
                    src={`${BACKEND_URI}${article?.bannerImage}`}
                    alt={article.title}
                    className="rounded-lg mb-4 w-full h-44"
                  />
                  <div className="flex justify-between">
                    <span className="text-green">{article?.createdBy}</span>
                    <span>
                      {new Date(article?.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="font-semibold">{article.title}</h2>
                  <p className="text-sm text-gray-400 line-clamp-3">
                    {article.description}
                  </p>
                  <button
                    onClick={() => navigate(`/blog/${article._id}`)}
                    className="text-green flex items-center gap-1 hover:text-green/90 cursor-pointer"
                  >
                    Read more <ArrowRight size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AllArticle;
