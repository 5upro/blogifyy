import React, { useState, useEffect } from 'react';
import { authAPI } from '../api';

const VerifyEmail = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        let verificationToken = token;
        
       
        if (!verificationToken) {
          const params = new URLSearchParams(window.location.search);
          verificationToken = params.get('token');
        }

        console.log('Verification token:', verificationToken);

        if (!verificationToken) {
          setError('Verification token is missing. Please check the email link.');
          setLoading(false);
          return;
        }

        console.log('Calling verify endpoint...');
        const response = await authAPI.verifyEmail(verificationToken);
        console.log('Verification response:', response.data);
        
        setError('');
        setMessage(response.data.message);
        setVerified(true);
      } catch (err) {
        console.error('Verification error:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Verification failed. Token may be expired.';
        setVerified(false);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <img src="./blog.png" alt="Blogify logo" className="mx-auto mb-6" style={{ maxHeight: '60px' }} />
          <h1 className="text-3xl font-bold text-gray-900">Email Verification</h1>
        </div>

        {loading && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg 
                className="animate-spin h-12 w-12 text-blue-600" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {verified && !loading && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg className="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Email Verified!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">Your email has been successfully verified.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
            >
              Go to Login
            </button>
          </div>
        )}

        {error && !loading && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg className="w-16 h-16 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Verification Failed</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
