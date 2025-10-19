// LiveChat.js
import { useEffect } from 'react';

function LiveChat() {
  useEffect(() => {
    const Tawk_API = window.Tawk_API || {};
    const Tawk_LoadStart = new Date();

    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = 'https://embed.tawk.to/685d37b90d497d191b31a29f/1ium23bm3'; // your widget URL
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    document.body.appendChild(s1);
  }, []);

  return null;
}

export default LiveChat;
