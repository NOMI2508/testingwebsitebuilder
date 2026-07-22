import HeroSection from "../components/sections/HeroSection";
import FeaturedCategories from "../components/sections/FeaturedCategories";
import BestSellers from "../components/sections/BestSellers";
import BrandStory from "../components/sections/BrandStory";
import NewsletterSignup from "../components/sections/NewsletterSignup";

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturedCategories />
      <BestSellers />
      <BrandStory />
      <NewsletterSignup />
    </>
  );
};

export default Home;