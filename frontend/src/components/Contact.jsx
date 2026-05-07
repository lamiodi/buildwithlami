import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          message: formData.message
        })
      });
      
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="bg-accent py-24">
      <div className="px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
        <div className="md:w-1/2">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-white">
            Let's Build Your Next Product
          </h2>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-light mb-12">
            Tell me what you're building - I'll help you design, develop, and launch it fast.
          </p>
          
          <div className="space-y-4">
            <a href="mailto:hello@buildwithlami.dev" className="flex items-center justify-center w-full md:w-auto bg-white dark:bg-[#1a1a1a] text-accent dark:text-white font-bold px-8 py-4 hover:bg-gray-100 dark:hover:bg-black transition-colors rounded-sm shadow-md">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Send an Email
            </a>
          </div>
        </div>

        <div className="md:w-1/2 w-full mt-12 md:mt-0">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <input 
                type="text" 
                placeholder="name" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-transparent border-b-2 border-white/50 py-3 text-white placeholder-white/70 focus:outline-none focus:border-white transition-colors text-lg"
              />
            </div>
            <div>
              <input 
                type="email" 
                placeholder="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-transparent border-b-2 border-white/50 py-3 text-white placeholder-white/70 focus:outline-none focus:border-white transition-colors text-lg"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="your message"
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-transparent border-b-2 border-white/50 py-3 text-white placeholder-white/70 focus:outline-none focus:border-white transition-colors text-lg"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={status === 'submitting' || status === 'success'}
              className={`w-full py-4 text-center text-lg font-bold uppercase transition-colors rounded-sm ${
                status === 'success' ? 'bg-green-500 text-white' : 
                status === 'submitting' ? 'bg-white/10 dark:bg-[#111] text-white/50 cursor-not-allowed' : 
                'bg-white text-accent dark:bg-[#111] dark:text-white hover:bg-gray-100 dark:hover:bg-black'
              }`}
            >
              {status === 'success' ? 'Message Sent!' : status === 'submitting' ? 'Sending...' : 'Start a Project'}
            </button>
            
            {status === 'error' && (
              <p className="text-red-200 text-sm text-center">There was an error sending your message. Please try again.</p>
            )}
          </form>
        </div>
      </div>

      <div className="mt-16 text-center w-full">
        <p className="text-white/80 text-sm md:text-base italic font-body">
          * I usually respond within a few hours
        </p>
      </div>
    </section>
  );
};

export default Contact;
