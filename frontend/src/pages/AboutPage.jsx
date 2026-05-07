import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    // SEO Best Practices
    document.title = "About | Eugene Odibenuah - Full-Stack Developer";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Learn more about Eugene Odibenuah, a Nigerian-based full-stack developer with expertise in React, Node.js, and building scalable business solutions.");
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-32 pb-24 px-6 md:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-4 mb-16 text-black dark:text-white"
        >
          <svg className="w-8 h-8 text-gray-400 dark:text-white/50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight uppercase">
            ABOUT ME 
          </h1>
          <svg className="w-8 h-8 text-gray-400 dark:text-white/50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Row 1: Left Image Card */}
          <motion.div variants={itemVariants} className="md:col-span-4 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 flex items-center justify-center shadow-xl">
            <div className="relative w-full aspect-square overflow-hidden rounded-3xl bg-accent">
              <img 
                src="https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=2070&auto=format&fit=crop" 
                alt="Eugene Setup" 
                className="w-full h-full object-cover opacity-90 mix-blend-overlay"
              />
            </div>
          </motion.div>

          {/* Row 1: Right Info Card */}
          <motion.div variants={itemVariants} className="md:col-span-8 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-10 md:p-12 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden group">
            <svg className="absolute top-10 left-10 w-8 h-8 text-gray-300 dark:text-white/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
            <div className="mt-12">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">Eugene Odibenuah</h2>
              <p className="text-gray-800 dark:text-gray-200 text-lg leading-[1.8] max-w-2xl font-light">
                I am a Nigerian-based full-stack web developer with a focus on building modern, scalable web applications that are fast, reliable, and easy to use. From idea to deployment, I focus on creating systems that not only work but grow with your business. I have a diverse range of experience working across various frontend and backend technologies.
              </p>
            </div>
          </motion.div>

          {/* Row 2: Experience Card */}
          <motion.div variants={itemVariants} className="md:col-span-6 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-10 md:p-12 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl">
            <h3 className="text-sm font-bold tracking-widest text-gray-500 dark:text-white/50 uppercase mb-8">Experience</h3>
            <div className="space-y-8">
              <div>
                <p className="text-gray-500 text-sm mb-1">2021 - Present</p>
                <h4 className="text-xl font-heading font-bold">Full-Stack Developer</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Freelance / Independent</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">2019 - 2021</p>
                <h4 className="text-xl font-heading font-bold">Frontend Engineer</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Tech Agency</p>
              </div>
            </div>
          </motion.div>

          {/* Row 2: Education Card */}
          <motion.div variants={itemVariants} className="md:col-span-6 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-10 md:p-12 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl">
            <h3 className="text-sm font-bold tracking-widest text-gray-500 dark:text-white/50 uppercase mb-8">Education</h3>
            <div className="space-y-8">
              <div>
                <p className="text-gray-500 text-sm mb-1">2017 - 2021</p>
                <h4 className="text-xl font-heading font-bold">Bachelor Degree in Computer Science</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">University of Lagos</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">2021 - 2022</p>
                <h4 className="text-xl font-heading font-bold">Advanced Web Development</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Tech Institute</p>
              </div>
            </div>
          </motion.div>

          {/* Row 3: Profiles Card */}
          <motion.div variants={itemVariants} className="md:col-span-3 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between group cursor-pointer hover:border-accent dark:hover:border-white/20 transition-colors">
            <div className="flex gap-4 mb-8 bg-gray-50 dark:bg-[#151515] w-fit p-4 rounded-2xl border border-gray-200 dark:border-white/5">
              <a href="#" className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-white/5 rounded-full hover:bg-accent hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-white/5 rounded-full hover:bg-accent hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Stay with me</p>
                <h4 className="text-xl font-heading font-bold">Profiles</h4>
              </div>
              <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </div>
            </div>
          </motion.div>

          {/* Row 3: Work Together Card */}
          <motion.div variants={itemVariants} className="md:col-span-6 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between group cursor-pointer hover:border-accent dark:hover:border-white/20 transition-colors relative overflow-hidden">
            <svg className="absolute top-8 left-8 w-8 h-8 text-gray-300 dark:text-white/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
            <div className="mt-12 mb-4">
              <h2 className="text-4xl md:text-5xl font-heading font-bold">
                Let's <br/>work <span className="text-accent">together.</span>
              </h2>
            </div>
            <Link to="/contact" className="absolute bottom-8 right-8 w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </Link>
          </motion.div>

          {/* Row 3: Credentials Card */}
          <motion.div variants={itemVariants} className="md:col-span-3 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between group cursor-pointer hover:border-accent dark:hover:border-white/20 transition-colors">
            <div className="mb-8 bg-gray-50 dark:bg-[#151515] w-full p-6 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center justify-center h-24">
              <span className="font-handwritten text-4xl text-black/80 dark:text-white/80">Eugene</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">More about me</p>
                <h4 className="text-xl font-heading font-bold">Credentials</h4>
              </div>
              <a href="/resume.pdf" target="_blank" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </a>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
