import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import api from "../../api/axiosClient";
import BACKEND_URI from "../../helper/backend";
import PageLoader from "../Loader/PageLoader";
import { getWithExpiry } from "../../helper/storageWithExpiry";

const ArticlePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [article, setArticle] = useState(null);

  const fetchArticle = async () => {
    try {
      setIsLoading(true);
      const cached = getWithExpiry("articles");
      if (cached) {
        const filteredArticle = cached.find((a) => a._id === id);
        setArticle(filteredArticle || null);
        return;
      }
      const { data } = await api.get(`/api/blog/get/${id}`);
      setArticle(data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  // FETCH BLOG BY SLUG
  useEffect(() => {
    fetchArticle();
  }, [id]);

  return (
    <div className="w-full h-full">
      {isLoading ? (
        <PageLoader />
      ) : !article ? (
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
        <section className="px-8 py-16 max-w-5xl mx-auto text-white">
          <button
            className="flex items-center gap-2 text-green mb-6 hover:underline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <h1 className="text-xl md:text-3xl font-bold mb-2">
            {article.title}
          </h1>
          <div className="flex gap-4 text-sm text-green mb-6">
            <span> {article?.createdBy && `BY ${article?.createdBy}`}</span>
            <span>{`Updated at: ${new Date(
              article.lastUpdated
            ).toLocaleDateString()}`}</span>
          </div>

          <img
            src={`${BACKEND_URI}${article.bannerImage}`}
            alt={article.title}
            className="w-full h-[400px] object-cover rounded-lg mb-6"
          />

          {/* Tags */}
          {article?.tags && article?.tags.length > 0 && (
            <div className="w-full flex mb-2 gap-2">
              {article.tags.map((t, index) => (
                <p key={index} className="bg-gray-500 px-2 py-1 rounded">
                  {t}
                </p>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-line">
            {article?.description}
          </div>

          {/* Sub title and Description */}
          {article?.sections && article?.sections.length > 0 && (
            <div className="w-full flex flex-col gap-2 mt-2">
              {article.sections.map((s, index) => (
                <div key={index}>
                  <h3 className="text-xl text-green">{s?.subTitle}</h3>
                  <p className="text-gray-300">{s?.subDescription}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ArticlePage;
