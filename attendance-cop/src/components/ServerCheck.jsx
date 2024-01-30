import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';

const ServerStatusIndicator = () => {
  const [serverConnected, setServerConnected] = useState(null);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await fetch('https://sixc1f0487-145f-4e33-8897-641d33f1d0e6.onrender.com/status');

        if (!response.ok) {
          throw new Error('Server status API request failed');
        }

        const data = await response.json();

        if (data.response === true) {
          setServerConnected(true);
        } else {
          setServerConnected(false);
        }
      } catch (error) {
        console.error('Error fetching server status:', error);
        setServerConnected(false);
      }
    };

    fetchServerStatus();
    const intervalId = setInterval(fetchServerStatus, 12000); 

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
      {serverConnected !== null && (
        <>
          {serverConnected ? (
            <span style={{ color: 'green', fontSize: '24px' }}>✔</span>
          ) : (
            <span style={{ color: 'red', fontSize: '24px' }}>✘</span>
          )}
          <Typography variant="caption" color="text.secondary">
            {serverConnected ? 'Server connected' : 'Server not connected'}
          </Typography>
        </>
      )}
    </div>
  );
};

export default ServerStatusIndicator;
