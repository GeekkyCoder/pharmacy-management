import React, { useState, useEffect } from 'react';
import Quagga from 'quagga';

const BarcodeScanner = () => {
  const [error, setError] = useState('');

  useEffect(() => {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector("#interactive"),
        constraints: {
          facingMode: "environment" // Use back camera if available
        },
      },
      decoder: {
        readers: [
          "ean_reader",
          "ean_8_reader",
          "code_128_reader",
          "code_39_reader",
          "upc_reader"
        ]
      }
    }, (err) => {
      if (err) {
        setError(`Camera initialization error: ${err}`);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((result) => {
      if (result.codeResult.code) {
        console.log('code', result.codeResult.code )
        // onScan(result.codeResult.code);
      }
    });

    // Cleanup on component unmount
    return () => {
      Quagga.stop();
    };
  }, []);

  return (
    <div className="barcode-scanner-container">
      <div id="interactive" className="viewport" style={{ 
        width: '100%', 
        maxWidth: '640px',
        height: '480px'
      }} />
      {error && (
        <p className="text-danger mt-2">{error}</p>
      )}
      <p className="text-muted mt-2">
        Point your camera at a barcode to scan
      </p>
    </div>
  );
};

export default BarcodeScanner;

