'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Users, Award, Truck, Shield } from 'lucide-react'
import Navigation from '../components/Navigation'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function AboutPage() {
  const [cartCount, setCartCount] = useState(0)

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
            <h1 className="text-5xl font-bold text-white mb-6">
              Growing fresh, natural vegetables in Rwanda since 2020.
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're committed to sustainable farming and delivering the highest quality produce.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                AgriHarvest was founded in 2020 with a simple mission: to provide Rwanda 
                with the freshest, highest quality natural vegetables while supporting 
                sustainable farming practices.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Located in the heart of Rwanda, our sustainable farms use 
                innovative agricultural techniques to grow pesticide-free vegetables year-round, 
                ensuring consistent quality and supply.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, we serve over 1,200 families across Rwanda, delivering fresh 
                vegetables directly to their doors while supporting local communities 
                and environmental sustainability.
              </p>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
                <div className="text-6xl mb-4 text-center">🌱</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Grown with Care
                </h3>
                <p className="text-gray-600 text-center">
                  Every vegetable is carefully tended using sustainable practices 
                  that respect both the environment and your health.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at AgriHarvest
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Quality First",
                description: "We never compromise on quality. Every vegetable is carefully inspected before leaving our farm."
              },
              {
                icon: Award,
                title: "Sustainability",
                description: "Our farming practices protect the environment for future generations while producing healthy food."
              },
              {
                icon: Users,
                title: "Community",
                description: "We support local communities by providing jobs and promoting healthy eating habits."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                className="text-center p-8 rounded-2xl bg-white shadow-lg"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <value.icon className="h-8 w-8" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Making a difference in Rwanda's agricultural landscape
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "1,200+", label: "Happy Customers" },
              { number: "50+", label: "Varieties Grown" },
              { number: "100%", label: "Natural Produce" },
              { number: "4.9/5", label: "Customer Rating" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to experience the freshness?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join thousands of families across Rwanda who trust AgriHarvest 
              for their daily vegetable needs. Start your healthy journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Shop Now
              </motion.button>
              <motion.button
                className="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-900 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 