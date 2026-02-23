import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import ProductRail from '@/components/home/ProductRail';
import Newsletter from '@/components/home/Newsletter';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedCollections />
      <ProductRail />
      <Newsletter />
    </Layout>
  );
};

export default Index;
