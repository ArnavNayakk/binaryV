import React from "react";
import { BookOpen, Download } from "lucide-react";
import assets from "../../assets/assets";

const Ebooks = () => {
  const ebooks = [
    {
      id: 1,
      title: "Stock exchange smart guide",
      desc: "If you are planning to start trading, then this book is perfect for you!",
      cover: assets?.smartguide,
      readLink:
        "https://drive.google.com/file/d/1gB5oT2-FCKlvZg00z_OiQ-ds3uWskoZi/preview",
      downloadLink:
        "https://drive.google.com/uc?export=download&id=1gB5oT2-FCKlvZg00z_OiQ-ds3uWskoZi",
    },
    {
      id: 2,
      title: "Candlestick patterns",
      desc: "Earn larger profits by recognising candlestick patterns and analysing the market based on those.",
      cover: assets?.candle,
      readLink:
        "https://drive.google.com/file/d/1S7bDG7KNJZTPjGnbb6YKQp36PFBUy5AN/preview",
      downloadLink:
        "https://drive.google.com/uc?export=download&id=1S7bDG7KNJZTPjGnbb6YKQp36PFBUy5AN",
    },
    {
      id: 3,
      title: "Chart patterns",
      desc: "31 chart formations. Recognise triangles, breakout points, and calculate the target prices.",
      cover: assets?.chart,
      readLink:
        "https://drive.google.com/file/d/1NoS1tpvrEWFXPRhKz82HvqUEF3qE_PVH/preview",
      downloadLink:
        "https://drive.google.com/uc?export=download&id=1NoS1tpvrEWFXPRhKz82HvqUEF3qE_PVH",
    },
    {
      id: 4,
      title: "Options",
      desc: "Apply the strategy which is the best fit for you and learn how to calculate risk and profit through examples.",
      cover: assets?.options,
      readLink:
        "https://drive.google.com/file/d/18xtPYRcldcLxCdHCY6cUoY5T6d0CL8H6/preview",
      downloadLink:
        "https://drive.google.com/uc?export=download&id=118xtPYRcldcLxCdHCY6cUoY5T6d0CL8H6",
    },
    {
      id: 5,
      title: "Bonds",
      desc: "If you are eager to earn returns and you’re avoiding risk, this book is a must read for you!",
      cover: assets?.bonds,
      readLink:
        "https://drive.google.com/file/d/1E2_bxcAyezb6GXZdPjTuQrRes02364AS/preview",
      downloadLink:
        "https://drive.google.com/uc?export=download&id=1E2_bxcAyezb6GXZdPjTuQrRes02364AS",
    },
    {
      id: 6,
      title: "How NOT to earn 300%",
      desc: "Examine real trading examples and use it for your own trading.",
      cover: assets?.hownot,
      readLink:
        "https://drive.google.com/file/d/1TZpbmeuJY9e3plsW4GLSUm3_zk0bNgFP/preview",
      downloadLink:
        "https://drive.google.com/uc?export=download&id=1TZpbmeuJY9e3plsW4GLSUm3_zk0bNgFP",
    },
    {
      id: 7,
      title: "Stock market dictionary",
      desc: "It contains approximately 2,400 expressions and abbreviations in investments and economics.",
      cover: assets?.dictionary,
      readLink:
        "https://drive.google.com/file/d/1IDZF3n6YNK_DOEQpRetokpWNkCAqPQtU/preview",
      downloadLink:
        "https://drive.google.com/uc?export=download&id=1IDZF3n6YNK_DOEQpRetokpWNkCAqPQtU",
    },
    {
      id: 8,
      title: "Indicators",
      desc: "25 indicators. Find the indicator that fits your strategy and learn its trading signals through examples.",
      cover: assets?.indicators,
      readLink:
        "https://drive.google.com/file/d/1HfMAUjohgWPahqFQbRJmqe-fchk0Xk8v/preview",
      downloadLink:
        "https://drive.google.com/uc?export=download&id=1HfMAUjohgWPahqFQbRJmqe-fchk0Xk8v",
    },
  ];

  return (
    <section className="bg-dark text-white py-16 px-6 md:px-20">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
        Trading <span className="text-green">eBooks</span>
      </h1>

      <p className="text-center text-gray-400 max-w-2xl mx-auto mb-6">
        Explore our collection of trading eBooks to learn strategies, analysis,
        risk management, and trading psychology. Read online or download for
        offline access.
      </p>

      <div className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ebooks.map((book) => (
          <div
            key={book.id}
            className="bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-green transition transform hover:-translate-y-2"
          >
            <img
              src={book?.cover}
              alt={book.title}
              className="w-full h-40 object-contain"
            />
            <div className="p-5">
              <h3 className="text-xl font-semibold text-green mb-2">
                {book.title}
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed mb-4">
                {book.desc}
              </p>
              <div className="flex justify-between gap-3">
                <a
                  href={book.readLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green text-dark font-medium hover:bg-green/90 w-1/2 duration-200"
                >
                  <BookOpen className="w-4 h-4" /> Read
                </a>
                <a
                  href={book.downloadLink}
                  download
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white font-medium hover:bg-gray-600 w-1/2"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Ebooks;
