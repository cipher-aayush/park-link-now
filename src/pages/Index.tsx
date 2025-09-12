import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ParkingSlots from "@/components/ParkingSlots";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ParkingSlots />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
