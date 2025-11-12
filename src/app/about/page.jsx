"use client";

import { motion } from "framer-motion";
import { Building2, ShieldCheck, HeartHandshake, Award, Clock } from "lucide-react";

const values = [
  {
    icon: Building2,
    title: "Trust & Transparency",
    description:
      "Every deal with Dubai Dreams Properties is rooted in honesty. From listing to handover, our transparent process builds lasting relationships with our clients.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: ShieldCheck,
    title: "Security & Assurance",
    description:
      "Your investments are safeguarded with verified listings, rigorous legal checks, and partnerships with the most trusted developers in Dubai.",
    gradient: "from-primary to-accent",
  },
  {
    icon: HeartHandshake,
    title: "Customer Commitment",
    description:
      "We go beyond expectations — personalized consultations, guided property tours, and a dedicated team ensure you find the perfect home or investment.",
    gradient: "from-secondary to-accent",
  },
  {
    icon: Award,
    title: "Luxury & Excellence",
    description:
      "We specialize in Dubai’s most prestigious properties — iconic towers, waterfront homes, and luxury residences. Experience service that matches the lifestyle.",
    gradient: "from-primary-dark to-secondary-dark",
  },
];

const About = () => {
  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative pt-20 px-6 sm:px-12 lg:px-24 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-primary/10 via-white to-secondary/10" />
        <div className="container mx-auto relative z-10 text-center max-w-4xl">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-6"
          >
            About Dubai Dreams Properties
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
          >
            Find Your Dream Property in Dubai
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg sm:text-xl text-gray-700 leading-relaxed"
          >
            We combine local expertise with global experience to help clients buy, sell, and invest in Dubai’s most prestigious locations. Your dream home is just a journey away.
          </motion.p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 sm:px-12 lg:px-24 bg-gradient-to-t from-white via-gray-50 to-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
            className="mb-16"
          >
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              Our Values
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              What Sets Us Apart
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Trust, security, client-first commitment, and luxury define everything we do. Experience real estate with a difference.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className={`flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${value.gradient} mb-6 shadow-lg`}>
                  <value.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-700 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Hours Section */}
      <section className="py-20 px-6 sm:px-12 lg:px-24 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/90 backdrop-blur-md p-12 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary/20"
          >
            <div className="flex items-center mb-8">
              <Clock className="w-10 h-10 text-primary mr-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-primary">Office Hours</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 text-lg">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span>Monday - Friday</span>
                <span className="font-medium text-gray-900">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span>Saturday</span>
                <span className="font-medium text-gray-900">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="font-medium text-gray-900">Closed</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
