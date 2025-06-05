'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import Navigation from '../components/Navigation'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function ContactPage() {
  const [cartCount, setCartCount] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  // Fetch cart count on component mount
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await fetch('/api/cart?sessionId=default')
        const result = await response.json()
        if (result.success) {
          setCartCount(result.data.summary.itemsCount)
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
      }
    }

    fetchCartCount()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation cartCount={cartCount} />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get in touch with AgriHarvest. We're here to help with 
              your questions, orders, and feedback.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We'd love to hear from you. Reach out to us through any of these channels.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: MapPin,
                title: "Visit Us",
                details: ["KG 123 St, Kigali", "Rwanda"]
              },
              {
                icon: Phone,
                title: "Call Us",
                details: ["+250 788 123 456", "+250 722 456 789"]
              },
              {
                icon: Mail,
                title: "Email Us",
                details: ["info@agriharvest.rw", "orders@agriharvest.rw"]
              },
              {
                icon: Clock,
                title: "Hours",
                details: ["Mon-Fri: 8AM-6PM", "Sat-Sun: 9AM-4PM"]
              }
            ].map((contact, index) => (
              <motion.div
                key={index}
                className="text-center p-8 rounded-2xl bg-white shadow-lg"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <contact.icon className="h-8 w-8" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{contact.title}</h3>
                <div className="space-y-1">
                  {contact.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="text-gray-600">{detail}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Send us a Message</h2>
            <p className="text-xl text-gray-600">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </motion.div>
          
          <motion.form
            onSubmit={handleSubmit}
            className="bg-gray-50 rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors"
                  placeholder="+250 788 123 456"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors"
                >
                  <option value="">Select a subject</option>
                  <option value="order">Order Inquiry</option>
                  <option value="product">Product Question</option>
                  <option value="delivery">Delivery Issue</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent transition-colors resize-none"
                placeholder="Tell us how we can help you..."
              />
            </div>
            
            <motion.button
              type="submit"
              className="w-full bg-green-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send Message
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Find answers to common questions about our products and services.
            </p>
          </motion.div>
          
          <div className="space-y-6">
            {[
              {
                question: "How fresh are your vegetables?",
                answer: "Our vegetables are harvested daily and delivered within 24 hours to ensure maximum freshness."
              },
              {
                question: "Do you deliver across Rwanda?",
                answer: "Yes, we deliver to major cities across Rwanda including Kigali, Huye, Rubavu, and Musanze."
              },
              {
                question: "Are your vegetables natural?",
                answer: "Yes, all our vegetables are 100% natural, grown without pesticides or harmful chemicals."
              },
              {
                question: "What is your return policy?",
                answer: "We offer a 100% satisfaction guarantee. If you're not happy with your order, we'll replace it or refund you."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 