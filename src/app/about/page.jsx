"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, ShieldCheck, HeartHandshake, Award, Clock } from "lucide-react";

const values = [
  {
    icon: Building2,
    title: "Trust & Transparency",
    description:
      "We believe in complete transparency throughout every transaction — from property listing to final handover. Our integrity is what earns client trust.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Assurance",
    description:
      "Your investments are protected through verified listings, legal due diligence, and trusted developer partnerships. Every deal is handled with care.",
  },
  {
    icon: HeartHandshake,
    title: "Customer Commitment",
    description:
      "Our clients are at the heart of everything we do. From personalized consultations to property tours, we go the extra mile to help you find your dream home or ideal investment.",
  },
  {
    icon: Award,
    title: "Luxury & Excellence",
    description:
      "We represent the best of Dubai’s real estate — exclusive communities, iconic skyscrapers, and waterfront luxury. Expect only premium service and experience.",
  },
];

const About = () => {
  return (
    <section className="w-full py-8 px-20 mt-10 bg-background">
      <div className="container mx-auto space-y-16">
        {/* About Us */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl text-center font-bold heading-gradient mb-4">
            About Dubai Dreams Properties
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Dubai Dreams Properties is a premier real estate firm dedicated to helping
            clients buy, sell, and invest in Dubai’s most sought-after locations. From
            off-plan developments to ready-to-move luxury residences, we offer a curated
            portfolio of high-end properties tailored to your lifestyle and goals.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our expert team combines deep local knowledge with global experience to guide
            investors, homeowners, and developers through every stage of their property
            journey. Whether you’re looking for your dream villa, a downtown apartment, or
            a high-return investment, we’re here to make it seamless.
          </p>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-3xl text-center md:text-4xl font-bold mb-4">
            Why Choose Us
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We’re not just brokers — we’re your real estate partners in Dubai. Our team
            understands the market dynamics, trends, and regulations that matter most,
            ensuring each deal aligns with your objectives. From property discovery to
            documentation and after-sale services, we simplify the process end-to-end.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our focus on precision, speed, and transparency has earned us the trust of
            clients across the UAE and beyond. With exclusive listings and strategic
            developer ties, Dubai Dreams Properties ensures you get the best deals and
            investment opportunities available in the market.
          </p>
        </motion.div>

        {/* Our Values */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-xl ring-primary hover:shadow-2xl transition"
              >
                <value.icon className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Office Hours */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl"
        >
          <div className="flex items-center mb-6">
            <Clock className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-2xl font-bold">Office Hours</h2>
          </div>
          <ul className="space-y-3 text-lg text-muted-foreground">
            <li className="flex justify-between">
              <span>Monday - Friday:</span>
              <span className="font-medium text-foreground">9:00 - 18:00</span>
            </li>
            <li className="flex justify-between">
              <span>Saturday:</span>
              <span className="font-medium text-foreground">10:00 - 16:00</span>
            </li>
            <li className="flex justify-between">
              <span>Sunday:</span>
              <span className="font-medium text-foreground">Closed</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
