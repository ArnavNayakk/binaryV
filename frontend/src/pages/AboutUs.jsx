import React, { useEffect, useState } from "react";
import AboutHero from "../components/AboutUs/AboutHero";
import AboutCard from "../components/AboutUs/AboutCard";
import Features from "../components/AboutUs/Features";
import Roadmap from "../components/AboutUs/RoadMap";
import api from "../api/axiosClient";

const AboutUs = () => {
  const [aboutData, setAboutData] = useState(null);
  const fetchAbout = async () => {
    try {
      const { data } = await api.get("/api/about/get-all");
      if (data.success) {
        setAboutData(data?.data?.[0]);
      }
    } catch (error) {
      console.log("Error getting about us data");
    }
  };

  console.log(aboutData);

  useEffect(() => {
    fetchAbout();
  }, []);
  return (
    <section className="bg-dark text-white min-h-screen px-6 md:px-20 py-16">
      <AboutHero aboutData={aboutData} />
      <AboutCard aboutData={aboutData} />
      <Features />
      <Roadmap />
    </section>
  );
};

export default AboutUs;
