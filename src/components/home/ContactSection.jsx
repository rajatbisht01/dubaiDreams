"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import ScrollReveal from "@/components/ui/scroll-reveal";
import AnimatedText from "@/components/ui/animated-text";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Children, useState } from "react";

const ConditionalWrapper = ({ condition, Wrapper, children, ...props }) => {
  return condition ? (
    <Wrapper {...props}>{children}</Wrapper>
  ) : (
    <div {...props}>{children}</div>
  );
};

const ContactSection = (scrollAnimation = true) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        alert(data.error || "Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const uaeInfo = [
    {
      icon: Phone,
      title: "UAE Contact",
      content: "+971 43247511",
      link: "tel:+97143247511",
    },
    {
      icon: Mail,
      title: "UAE Email",
      content: "support@aerosolscientific.com",
      link: "mailto:support@aerosolscientific.com",
    },
    {
      icon: MapPin,
      title: "UAE Address",
      content:
        "217-0152, Al Qayada Building, Dubai International Airport Area, Dubai, UAE.",
      link: "https://maps.google.com/?q=217-0152,Al+Qayada+Building,Dubai+International+Airport+Area,Dubai,UAE",
    },
  ];

  const indiaInfo = [
    {
      icon: Phone,
      title: "India Contact",
      content: "+91 9891118109",
      link: "tel:+919891118109",
    },
    {
      icon: Mail,
      title: "India Email",
      content: "support@aerosolscientific.com",
      link: "mailto:support@aerosolscientific.com",
    },
    {
      icon: MapPin,
      title: "India Address",
      content:
        "F-4, 1st Floor, Pankaj Plaza, Karka Duma, Anand Vihar, Delhi-110092",
      link: "https://maps.google.com/?q=F-4,1st+Floor,Pankaj+Plaza,Karka+Duma,Anand+Vihar,Delhi-110092",
    },
  ];

  const renderInfo = (infoArr) =>
    infoArr.map((info, index) => {
      const isAddress = info.icon === MapPin; // allow only address to be clickable

      const Wrapper = isAddress ? motion.a : motion.div;
      const wrapperProps = isAddress
        ? {
            href: info.link,
            target: "_blank",
            rel: "noopener noreferrer",
          }
        : {
            className: "select-none pointer-events-none", // disables copy + click
          };

      return (
        <Wrapper
          key={index}
          {...wrapperProps}
          className="flex items-center p-4 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          whileHover={isAddress ? { scale: 1.03 } : {}}
        >
          <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <info.icon className="w-5 h-5 text-primary" />
          </div>
          <div className="ml-4 max-w-full overflow-hidden">
            <h4 className="font-medium text-gray-800">{info.title}</h4>
            <p className="text-gray-700 break-words whitespace-normal">
              {info.content}
            </p>
          </div>
        </Wrapper>
      );
    });

  return (
    <section
      id="contact"
      className="w-full pl-2 overflow-hidden pb-14 pt-8 relative"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <AnimatedText delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              Get In <span className="text-primary">Touch</span>
            </h2>
          </AnimatedText>

          <AnimatedText delay={0.1}>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-gray-700">
              Ready to collaborate on your next project? Let's discuss how our
              expertise can advance your research and development goals.
            </p>
          </AnimatedText>
        </div>

        <div className="grid grid-cols-9  gap-16  mx-auto">
          {/* Contact Form */}

          <ConditionalWrapper
            condition={scrollAnimation}
            Wrapper={ScrollReveal}
            className="grid text-center h-[90vh] col-span-4"
            direction="left"
            delay={0.2}
          >
            <Card className="p-8  bg-gradient-to-r from-[hsl(195,85%,45%)] to-[hsl(160,60%,50%)] shadow-xl rounded-2xl hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold mb-12 text-gray-800">
                Send us a message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-8">
                {["name", "email", "subject"].map((field, idx) => (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    <Input
                      type={field === "email" ? "email" : "text"}
                      placeholder={`Your ${
                        field.charAt(0).toUpperCase() + field.slice(1)
                      }`}
                      value={formData[field]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      className="bg-white h-12 rounded-2xl border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-300"
                    />
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="bg-white rounded-2xl border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-300 min-h-36"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-brand/80 text-black font-medium rounded-lg shadow-md flex items-center justify-center px-6 py-3 text-lg transition-all duration-200 ${
                      loading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    whileHover={{
                      scale: loading ? 1 : 1.03,
                      boxShadow: loading
                        ? "none"
                        : "0 8px 20px rgba(0,0,0,0.25)",
                    }}
                    whileTap={{
                      scale: loading ? 1 : 0.97,
                      boxShadow: loading ? "none" : "0 4px 6px rgba(0,0,0,0.2)",
                    }}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    <span>{loading ? "Sending..." : "Send Message"}</span>
                  </motion.button>
                </motion.div>
              </form>
            </Card>
          </ConditionalWrapper>

          {/* Contact Info */}
          <ConditionalWrapper
            condition={scrollAnimation}
            Wrapper={ScrollReveal}
            className="grid col-span-5"
            direction="right"
            delay={0.2}
          >
            <div className="">
              <div>
                <h3 className="text-2xl font-semibold mb-5 text-gray-800">
                  Contact Information
                </h3>
                <p className="text-gray-700 leading-relaxed mb-5">
                  We're here to help you advance your research and development
                  initiatives. Reach out to discuss your specific requirements
                  and learn how we can collaborate on innovative solutions.
                </p>
              </div>

              {/* Grouped Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-gray-800">
                    UAE Office
                  </h4>
                  {renderInfo(uaeInfo)}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-gray-800">
                    India Office
                  </h4>
                  {renderInfo(indiaInfo)}
                </div>
              </div>

              {/* Office Hours */}
              <motion.div
                className="mt-4 text-center p-6 bg-gray-50 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <h4 className="font-semibold mb-2 text-gray-800">
                  Office Hours
                </h4>
                <p className="text-gray-700 text-sm">
                  Monday - Friday: 8:00 AM - 6:00 PM EST
                  <br />
                  Saturday: 9:00 AM - 2:00 PM EST
                  <br />
                  Sunday: Closed
                </p>
              </motion.div>
            </div>
          </ConditionalWrapper>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
